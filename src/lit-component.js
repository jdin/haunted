import {LitElement} from "lit-element";
// import {LitElement} from 'https://unpkg.com/lit-element@^2.1.0/lit-element.js';
import {effectsSymbol, hookSymbol} from "./symbols";
import {clear, setCurrent} from "./interface";

class LitContainer {

    constructor(renderer, host) {
        this.renderer = renderer;
        this.host = host;
        this[hookSymbol] = new Map();
    }

    update() {
        this.host.requestUpdate();
    }

    render() {
        setCurrent(this);
        const result = this.renderer.call(this.host, this.host);
        clear();
        return result;
    }

    runEffects(symbol) {
        let effects = this[symbol];
        if (effects) {
            setCurrent(this);
            for (let effect of effects) {
                effect.call(this);
            }
            clear();
        }
    }

    teardown() {
        let hooks = this[hookSymbol];
        hooks.forEach((hook) => {
            if (typeof hook.teardown === 'function') {
                hook.teardown();
            }
        })
    }
}

/**
 * Works with components based on LitElement
 * @param renderer the renderer function
 * @param BaseElement - LitElement or its subclass
 * @param options
 * @returns {Element}
 */
export function component(renderer, BaseElement = LitElement, options = {useShadowDOM: true}) {
    class Element extends BaseElement {
        static get properties() {
            return renderer.observedAttributes || [];
        }

        createRenderRoot() {
            return options.useShadowDOM ? this.attachShadow({mode: "open"}) : this;
        }

        constructor() {
            super();
            this._container = new LitContainer(renderer, this);
        }

        render() {
            return this._container.render()
        }

        updated(_changedProperties) {
            if (this._container[effectsSymbol]) {
                this._container.runEffects(effectsSymbol);
            }
            super.updated(_changedProperties);
        }

        disconnectedCallback() {
            this._container.teardown();
            super.disconnectedCallback();
        }
    }

    return Element
}
