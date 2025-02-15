import React from "@modules/react";
import DiscordModules from "@modules/discordmodules";
import Strings from "@modules/strings";

const {useState, useCallback} = React;


const Checkmark = React.memo((props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" fill={props.color ?? "#fff"} d="M8.99991 16.17L4.82991 12L3.40991 13.41L8.99991 19L20.9999 7.00003L19.5899 5.59003L8.99991 16.17Z" />
    </svg>
));

const Dropper = React.memo((props) => (
    <svg width="14" height="14" viewBox="0 0 16 16" {...props}>
        <g fill="none">
            <path d="M-4-4h24v24H-4z"/>
            <path fill={props.color ?? "#fff"} d="M14.994 1.006C13.858-.257 11.904-.3 10.72.89L8.637 2.975l-.696-.697-1.387 1.388 5.557 5.557 1.387-1.388-.697-.697 1.964-1.964c1.13-1.13 1.3-2.985.23-4.168zm-13.25 10.25c-.225.224-.408.48-.55.764L.02 14.37l1.39 1.39 2.35-1.174c.283-.14.54-.33.765-.55l4.808-4.808-2.776-2.776-4.813 4.803z" />
        </g>
    </svg>
));

const defaultColors = [1752220, 3066993, 3447003, 10181046, 15277667, 15844367, 15105570, 15158332, 9807270, 6323595, 1146986, 2067276, 2123412, 7419530, 11342935, 12745742, 11027200, 10038562, 9936031, 5533306];

const resolveColor = (color, hex = true) => {
    switch (typeof color) {
        case (hex && "number"): return `#${color.toString(16)}`;
        case (!hex && "string"): return Number.parseInt(color.replace("#", ""), 16);
        case (!hex && "number"): return color;
        case (hex && "string"): return color;

        default: return color;
    }
};

const getRGB = (color) => {
    let result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color);
    if (result) return [parseInt(result[1]), parseInt(result[2]), parseInt(result[3])];

    result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)%\s*,\s*([0-9]+(?:\.[0-9]+)?)%\s*,\s*([0-9]+(?:\.[0-9]+)?)%\s*\)/.exec(color);
    if (result) return [parseFloat(result[1]) * 2.55, parseFloat(result[2]) * 2.55, parseFloat(result[3]) * 2.55];

    result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color);
    if (result) return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
    
    result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color);
    if (result) return [parseInt(result[1] + result[1], 16), parseInt(result[2] + result[2], 16), parseInt(result[3] + result[3], 16)];
};

const luma = (color) => {
    const rgb = (typeof(color) === "string") ? getRGB(color) : color;
    return (0.2126 * rgb[0]) + (0.7152 * rgb[1]) + (0.0722 * rgb[2]); // SMPTE C, Rec. 709 weightings
};

const getContrastColor = (color) => {
    return (luma(color) >= 165) ? "#000" : "#fff";
};


export default function Color({value: initialValue, onChange, colors = defaultColors, defaultValue, disabled}) {
    const [value, setValue] = useState(initialValue);
    const change = useCallback((e) => {
        if (disabled) return;
        onChange?.(resolveColor(e.target.value));
        setValue(e.target.value);
    }, [onChange, disabled]);

    const intValue = resolveColor(value, false);
    return <div className={`bd-color-picker-container ${disabled ? "bd-color-picker-disabled" : ""}`}>
        <div className="bd-color-picker-controls">
            {defaultValue && <DiscordModules.Tooltip text="Default" position="bottom">
                {props => (
                    <div {...props} className="bd-color-picker-default" style={{backgroundColor: resolveColor(defaultValue)}} onClick={() => change({target: {value: defaultValue}})}>
                        {intValue === resolveColor(defaultValue, false)
                            ? <Checkmark width="25" height="25" />
                            : null
                        }
                    </div>
                )}
            </DiscordModules.Tooltip>}
            <DiscordModules.Tooltip text={Strings.Settings.customColor} position="bottom">
                {props => (
                    <div className="bd-color-picker-custom">
                        <Dropper color={getContrastColor(resolveColor(value, true))} />
                        <input {...props} style={{backgroundColor: resolveColor(value)}} type="color" className="bd-color-picker" value={resolveColor(value)} onChange={change} disabled={disabled} />
                    </div>
                )}
            </DiscordModules.Tooltip>
        </div>
        {colors?.length > 0 && <div className="bd-color-picker-swatch">
            {
                colors.map((int, index) => (
                    <div key={index} className="bd-color-picker-swatch-item" style={{backgroundColor: resolveColor(int)}} onClick={() => change({target: {value: int}})}>
                        {intValue === int
                            ? <Checkmark color={getContrastColor(resolveColor(value, true))} />
                            : null
                        }
                    </div>
                ))
            }
        </div>}
    </div>;
}