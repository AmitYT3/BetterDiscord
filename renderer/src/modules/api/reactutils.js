import Utilities from "../utilities";
import DiscordModules from "../discordmodules";

/**
 * `ReactUtils` is a utility class for interacting with React internals. Instance is accessible through the {@link BdApi}.
 * This is extremely useful for interacting with the internals of the UI.
 * @type ReactUtils
 * @summary {@link ReactUtils} is a utility class for interacting with React internals.
 * @memberof BdApi
 * @name ReactUtils
 */
const ReactUtils = {

    get rootInstance() {return document.getElementById("app-mount")?._reactRootContainer?._internalRoot?.current;},

    /**
     * Get the internal react data of a specified node
     * 
     * @param {HTMLElement} node Node to get the react data from
     * @returns {object|undefined} Either the found data or `undefined` 
     */
    getInternalInstance(node) {
        if (node.__reactFiber$) return node.__reactFiber$;
        return node[Object.keys(node).find(k => k.startsWith("__reactInternalInstance") || k.startsWith("__reactFiber"))] || null;
    },

    /**
      * Grabs a value from the react internal instance. Allows you to grab
      * long depth values safely without accessing no longer valid properties.
      * @param {(HTMLElement|jQuery)} node - node to obtain react instance of
      * @param {object} options - options for the search
      * @param {array} [options.include] - list of items to include from the search
      * @param {array} [options.exclude=["Popout", "Tooltip", "Scroller", "BackgroundFlash"]] - list of items to exclude from the search
      * @param {callable} [options.filter=_=>_] - filter to check the current instance with (should return a boolean)
      * @return {(*|null)} the owner instance or undefined if not found.
      */
    getOwnerInstance(node, {include, exclude = ["Popout", "Tooltip", "Scroller", "BackgroundFlash"], filter = _ => _} = {}) {
        if (node === undefined) return undefined;
        const excluding = include === undefined;
        const nameFilter = excluding ? exclude : include;
        function getDisplayName(owner) {
            const type = owner.type;
            if (!type) return null;
            return type.displayName || type.name || null;
        }
        function classFilter(owner) {
            const name = getDisplayName(owner);
            return (name !== null && !!(nameFilter.includes(name) ^ excluding));
        }
        
        let curr = ReactUtils.getReactInstance(node);
        for (curr = curr && curr.return; !Utilities.isNil(curr); curr = curr.return) {
            if (Utilities.isNil(curr)) continue;
            const owner = curr.stateNode;
            if (!Utilities.isNil(owner) && !(owner instanceof HTMLElement) && classFilter(curr) && filter(owner)) return owner;
        }
        
        return null;
    },

    /**
      * Creates an unrendered react component that wraps dom elements.
      * @param {HTMLElement} element - element or array of elements to wrap into a react component
      * @returns {object} - unrendered react component
      */
    wrapElement(element) {
        return class ReactWrapper extends DiscordModules.React.Component {
            constructor(props) {
                super(props);
                this.element = element;
            }
    
            componentDidMount() {this.refs.element.appendChild(this.element);}
            render() {return DiscordModules.React.createElement("div", {className: "react-wrapper", ref: "element"});}
        };
    }

};

Object.freeze(ReactUtils);

export default ReactUtils;