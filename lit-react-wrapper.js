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
      styleElement: Object,
    };
  }

  constructor() {
    super();
    this.props = {};
    this.styles = [];
    this.styleElement = null;
  }

  render() {
    return html` <div id="mountPoint"></div> `;
  }

  createElement() {
    const props = this.props || {};
    if (!props.mountContainer) props.mountContainer = this.mountPoint;
    if (!props.mountDocument) props.mountDocument = this.shadowRoot || document;
    this.reactElement = React.createElement(this.element, props, React.createElement("slot"));
    return this.reactElement;
  }

  injectStyles() {
    if (this.styleElement && this.shadowRoot.contains(this.styleElement)) {
      this.shadowRoot.removeChild(this.styleElement);
    }

    const styleContent = Array.isArray(this.styles) ? this.styles.join("\n") : this.styles;

    if (styleContent) {
      this.styleElement = document.createElement("style");
      this.styleElement.textContent = styleContent;
      this.shadowRoot.insertBefore(this.styleElement, this.mountPoint);
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
    this.injectStyles();
    this.renderElement();
    retargetEvents(this.shadowRoot);
  }

  updated(changedProperties) {
    if (changedProperties.has("styles") || changedProperties.has("element")) {
      this.injectStyles();
    }
    if (changedProperties.has("props") || changedProperties.has("element")) {
      this.renderElement();
    }
  }
}

window.customElements.define("lit-react-wrapper", LitReactWrapper);
