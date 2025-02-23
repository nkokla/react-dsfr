import React, { useState } from "react";
import { makeStyles } from "./makeStyles";
import { SearchBar } from "../../dist/SearchBar";
import { Button } from "../../dist/Button";
import { fr } from "../../dist/fr";
import { NonPostableEvt } from "evt";
import { useEvt } from "evt/hooks";
import { Select } from "../../dist/Select";
import { useEffectOnValueChange } from "powerhooks/useEffectOnValueChange";

export type Props = {
    className?: string;
    search: string;
    onSearchChange: (search: string) => void;
    evtAction: NonPostableEvt<"scroll to">;
    contextes: string[];
    context: string | undefined;
    onContextChange: (context: string | undefined) => void;
    colors: string[];
    color: string | undefined;
    onColorChange: (color: string | undefined) => void;
    usages: string[];
    usage: string | undefined;
    onUsageChange: (usage: string | undefined) => void;
};

export function Search(props: Props) {
    const {
        className,
        search,
        onSearchChange,
        evtAction,
        contextes,
        context,
        onContextChange,
        colors,
        color,
        onColorChange,
        usages,
        usage,
        onUsageChange
    } = props;

    const [inputElement, setInputElement] = useState<HTMLInputElement | null>(null);
    const [searchBarWrapperElement, setSearchBarWrapperElement] = useState<HTMLDivElement | null>(
        null
    );
    const [filtersWrapperDivElement, setFiltersWrapperDivElement] = useState<HTMLDivElement | null>(
        null
    );

    useEvt(
        ctx => {
            evtAction.attach(
                action => action === "scroll to",
                ctx,
                () => {
                    inputElement?.focus();
                    searchBarWrapperElement?.scrollIntoView({
                        "behavior": "smooth",
                        "block": "start"
                    });
                }
            );
        },
        [evtAction, inputElement, searchBarWrapperElement]
    );

    const [areFiltersOpen, setAreFiltersOpen] = useState(false);

    useEffectOnValueChange(() => {
        if (areFiltersOpen) {
            return;
        }

        onColorChange(undefined);
        onColorChange(undefined);
        onUsageChange(undefined);
    }, [areFiltersOpen]);

    const { classes, cx } = useStyles({
        "filterWrapperMaxHeight": areFiltersOpen ? filtersWrapperDivElement?.scrollHeight ?? 0 : 0
    });

    return (
        <>
            <div
                className={cx(classes.root, className)}
                ref={searchBarWrapperElement => setSearchBarWrapperElement(searchBarWrapperElement)}
            >
                <SearchBar
                    className={classes.searchBar}
                    label="Filter by color code (e.g. #c9191e), CSS variable name (e.g. --text-active-red-marianne) or something else..."
                    nativeInputProps={{
                        "ref": inputElement => setInputElement(inputElement),
                        "value": search,
                        "onChange": event => onSearchChange(event.target.value)
                    }}
                />
                <Button
                    className={classes.filterButton}
                    iconId={areFiltersOpen ? "ri-arrow-down-s-fill" : "ri-arrow-up-s-fill"}
                    iconPosition="right"
                    onClick={() => setAreFiltersOpen(!areFiltersOpen)}
                >
                    Filters
                </Button>
            </div>
            <div
                ref={filtersWrapperDivElement =>
                    setFiltersWrapperDivElement(filtersWrapperDivElement)
                }
                className={classes.filtersWrapper}
            >
                <Select
                    label={`Filter by context (${contextes.length})`}
                    disabled={contextes.length === 0}
                    nativeSelectProps={{
                        "onChange": event =>
                            onContextChange(event.target.value || (undefined as any)),
                        "defaultValue": context ?? ""
                    }}
                >
                    {[undefined, ...contextes].map(context => (
                        <option value={context ?? ""} key={context ?? 0}>
                            {context ?? "No no context selected..."}
                        </option>
                    ))}
                </Select>
                <Select
                    label={`Filter by color name (${colors.length})`}
                    disabled={colors.length === 0}
                    nativeSelectProps={{
                        "onChange": event =>
                            onColorChange(event.target.value || (undefined as any)),
                        "defaultValue": color ?? ""
                    }}
                >
                    {[undefined, ...colors].map(color => (
                        <option value={color ?? ""} key={color ?? 0}>
                            {color ?? "No no color selected..."}
                        </option>
                    ))}
                </Select>
                <Select
                    label={`Filter by usage (${usages.length})`}
                    disabled={usages.length === 0}
                    nativeSelectProps={{
                        "onChange": event =>
                            onUsageChange(event.target.value || (undefined as any)),
                        "defaultValue": usage ?? ""
                    }}
                >
                    {[undefined, ...usages].map(usage => (
                        <option value={usage ?? ""} key={usage ?? 0}>
                            {usage ?? "No usage selected..."}
                        </option>
                    ))}
                </Select>
            </div>
        </>
    );
}

const useStyles = makeStyles<{ filterWrapperMaxHeight: number }>({ "name": { Search } })(
    (theme, { filterWrapperMaxHeight }) => ({
        "root": {
            "display": "flex",
            "paddingTop": fr.spacing("6v")
        },
        "searchBar": {
            "flex": 1
        },
        "filterButton": {
            "backgroundColor": theme.decisions.background.actionLow.blueFrance.default,
            "&&&:hover": {
                "backgroundColor": theme.decisions.background.actionLow.blueFrance.hover
            },
            "color": theme.decisions.text.actionHigh.blueFrance.default,
            "marginLeft": fr.spacing("4v")
        },
        "filtersWrapper": {
            "transition": "max-height 0.2s ease-out",
            "maxHeight": filterWrapperMaxHeight,
            "overflow": "hidden",
            "display": "flex",
            "marginTop": fr.spacing("4v"),
            "& > *": {
                "flex": 1,
                ...fr.spacing("padding", {
                    "rightLeft": "4v"
                })
            }
        }
    })
);
