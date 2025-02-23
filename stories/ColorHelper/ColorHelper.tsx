import React, { useState, useTransition } from "react";
import { CallOut } from "../../dist/CallOut";
import { colorDecisionAndCorrespondingOption } from "../../dist/fr/generatedFromCss/colorDecisionAndCorrespondingOptions";
import type { ColorDecisionAndCorrespondingOption } from "../../src/scripts/build/cssToTs/colorDecisionAndCorrespondingOptions";
import { fr } from "../../dist/fr";
import { createUseDebounce } from "powerhooks/useDebounce";
import { Fzf } from "fzf";
import { MuiDsfrThemeProvider } from "../../dist/mui";
import { Search } from "./Search";
import { useConst } from "powerhooks/useConst";
import { Evt } from "evt";
import { useStyles } from "./makeStyles";
import { ColorDecisionCard } from "./ColorDecisionCard";
import type { Props as SearchProps } from "./Search";
import { useEffectOnValueChange } from "powerhooks/useEffectOnValueChange";

export function ColorHelper() {
    const [search, setSearch] = useState("");

    const [
        filteredColorDecisionAndCorrespondingOption,
        setFilteredColorDecisionAndCorrespondingOption
    ] = useState<readonly ColorDecisionAndCorrespondingOption[]>(
        colorDecisionAndCorrespondingOption
    );

    const [context, setContext] = useState<SearchProps["context"]>(undefined);
    const [color, setColor] = useState<SearchProps["color"]>(undefined);
    const [usage, setUsage] = useState<SearchProps["usage"]>(undefined);

    useDebounce(
        () =>
            setFilteredColorDecisionAndCorrespondingOption(
                filterColorDecisionAndCorrespondingOption({
                    search,
                    context,
                    color,
                    usage
                })
            ),
        [search]
    );

    {
        const [, startTransition] = useTransition();

        useEffectOnValueChange(() => {
            startTransition(() =>
                setFilteredColorDecisionAndCorrespondingOption(
                    filterColorDecisionAndCorrespondingOption({
                        search,
                        context,
                        color,
                        usage
                    })
                )
            );
        }, [context, color, usage]);
    }

    const { css } = useStyles();

    const evtSearchAction = useConst(() => Evt.create<"scroll to">());

    return (
        <MuiDsfrThemeProvider>
            <div>
                <CallOut
                    className={css({ "marginBottom": 0 })}
                    title="Color Helper tool"
                    iconId="ri-palette-line"
                    buttonProps={{
                        "onClick": () => evtSearchAction.post("scroll to"),
                        "children": "Start searching"
                    }}
                >
                    This tool help you find the perfect DSFR color decision for your usecase.
                    <br />
                    <br />
                    If you have the hex code (e.g. <code>#c9191e</code>) of a color that you know
                    belong to the DSFR palette you can use the filter to find to witch decision it
                    correspond.
                </CallOut>
                <Search
                    evtAction={evtSearchAction}
                    onSearchChange={search => setSearch(search)}
                    search={search}
                    contextes={contextes.filter(
                        context =>
                            filterColorDecisionAndCorrespondingOption({
                                search,
                                context,
                                color,
                                usage
                            }).length !== 0
                    )}
                    context={context}
                    onContextChange={setContext}
                    colors={colors.filter(
                        color =>
                            filterColorDecisionAndCorrespondingOption({
                                search,
                                context,
                                color,
                                usage
                            }).length !== 0
                    )}
                    color={color}
                    onColorChange={setColor}
                    usages={usages.filter(
                        usage =>
                            filterColorDecisionAndCorrespondingOption({
                                search,
                                context,
                                color,
                                usage
                            }).length !== 0
                    )}
                    usage={usage}
                    onUsageChange={setUsage}
                />
                <h3 style={{ "marginTop": fr.spacing("6v") }}>
                    {search === ""
                        ? `${filteredColorDecisionAndCorrespondingOption.length} color decisions`
                        : `Found ${filteredColorDecisionAndCorrespondingOption.length} decisions matching your query`}
                </h3>
                {filteredColorDecisionAndCorrespondingOption.map(
                    (colorDecisionAndCorrespondingOption, i) => (
                        <ColorDecisionCard
                            {...colorDecisionAndCorrespondingOption}
                            key={i}
                            className={css({ "marginTop": fr.spacing("4v") })}
                        />
                    )
                )}
            </div>
        </MuiDsfrThemeProvider>
    );
}

const colors = Array.from(
    new Set(
        colorDecisionAndCorrespondingOption.map(
            ({ parsedColorDecisionName }) => parsedColorDecisionName.colorName
        )
    )
);

const contextes = Array.from(
    new Set(
        colorDecisionAndCorrespondingOption.map(
            ({ parsedColorDecisionName }) => parsedColorDecisionName.context
        )
    )
);

const usages = Array.from(
    new Set(
        colorDecisionAndCorrespondingOption.map(
            ({ parsedColorDecisionName }) => parsedColorDecisionName.usage
        )
    )
);

const { useDebounce } = createUseDebounce({ "delay": 400 });

const { filterColorDecisionAndCorrespondingOption } = (() => {
    const fzf = new Fzf<readonly ColorDecisionAndCorrespondingOption[]>(
        colorDecisionAndCorrespondingOption,
        {
            "selector": ({
                colorDecisionName,
                themePath,
                colorOption: { colorOptionName, themePath: optionThemePath, color }
            }) =>
                `${colorDecisionName} ${["theme", "decisions", ...themePath].join(
                    "."
                )} ${colorOptionName} ${["theme", "options", ...optionThemePath].join(".")} ${
                    typeof color === "string" ? color : `${color.light} ${color.dark}`
                }`
        }
    );

    function filterColorDecisionAndCorrespondingOption(params: {
        search: string;
        context: SearchProps["context"] | undefined;
        color: SearchProps["color"] | undefined;
        usage: SearchProps["usage"] | undefined;
    }) {
        const { search, context, color, usage } = params;

        return fzf
            .find(search)
            .map(
                ({ item: colorDecisionAndCorrespondingOption }) =>
                    colorDecisionAndCorrespondingOption
            )
            .filter(({ parsedColorDecisionName }) =>
                context === undefined ? true : parsedColorDecisionName.context === context
            )
            .filter(({ parsedColorDecisionName }) =>
                color === undefined ? true : parsedColorDecisionName.colorName === color
            )
            .filter(({ parsedColorDecisionName }) =>
                usage === undefined ? true : parsedColorDecisionName.usage === usage
            );
    }

    return { filterColorDecisionAndCorrespondingOption };
})();
