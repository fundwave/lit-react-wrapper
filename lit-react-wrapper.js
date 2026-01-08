import { html, LitElement } from "lit";
import * as ReactDOM from "react-dom";
import * as React from "react";
import * as retargetEvents from "react-shadow-dom-retarget-events";
import { StylesProvider, jssPreset } from "@material-ui/styles";
import { create } from "jss";

export class LitReactWrapper extends LitElement {
  static get properties() {
    return {
      mountPoint: Object,
      props: Object,
      element: Object,
      styles: Array,
      _styleElement: Object,
      _reactRef: Object,
      _reactElement: Object,
    };
  }

  constructor() {
    super();
    this.props = {};
    this.styles = [];
    this._styleElement = null;
    this._reactRef = React.createRef();
  }

  render() {
    return html` <div id="mountPoint"></div> `;
  }

  createElement() {
    const props = this.props || {};
    if (!props.mountContainer) props.mountContainer = this.mountPoint;
    if (!props.mountDocument) props.mountDocument = this.shadowRoot || document;
    this._reactElement = React.createElement(this.element, { ...props, ref: this._reactRef }, React.createElement("slot"));
    return this._reactElement;
  }
  getRef() {
    return this._reactRef;
  }

  injectStyles() {
    if (this._styleElement && this.shadowRoot.contains(this._styleElement)) {
      this.shadowRoot.removeChild(this._styleElement);
    }

    let styleContent = "";
    if (Array.isArray(this.styles)) {
      styleContent = this.styles.join("\n");
    } else if (typeof this.styles === "string") {
      styleContent = this.styles;
    }

    if (styleContent) {
      this._styleElement = document.createElement("style");
      this._styleElement.textContent = styleContent;
      this.shadowRoot.insertBefore(this._styleElement, this.mountPoint);
    }
  }

  renderElement() {
    const jss = create({
      ...jssPreset(),
      insertionPoint: this.mountPoint,
    });
    ReactDOM.render(
      <StylesProvider jss={jss} sheetsManager={new Map()}>
        {this.createElement()}
      </StylesProvider>,
      this.mountPoint
    );
  }

  firstUpdated() {
    this.mountPoint = this.shadowRoot.getElementById("mountPoint");
    this.renderElement();
    retargetEvents(this.shadowRoot);
  }

  updated(changedProperties) {
    if (changedProperties.has("styles")) {
      this.injectStyles();
    }
    if (changedProperties.has("props") || changedProperties.has("element")) {
      this.renderElement();
    }
  }
}

window.customElements.define("lit-react-wrapper", LitReactWrapper);
