import { html, LitElement } from 'lit';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import * as retargetEvents from 'react-shadow-dom-retarget-events';
import { StylesProvider, jssPreset } from '@material-ui/styles';
import { create } from 'jss';


export class LitReactWrapper extends LitElement {
  
  static get properties(){
    return {
      mountPoint: Object,
      props: Object,
      element: Object
    }
  }
  
  constructor(){
    super();
    this.props={};
  }
  
  render() {
    return html`
      <div id="mountPoint"></div>
    `;
  }

  createElement() {
    this.reactElement = React.createElement(this.element, { ...this.props, mountPoint: this.mountPoint }, React.createElement('slot'));
    return this.reactElement;
  }
  
  renderElement(){
    const jss = create({
      ...jssPreset(),
      insertionPoint: this.mountPoint
    });
    ReactDOM.render(
      <StylesProvider jss={jss} sheetsManager={new Map()}>
        {this.createElement()}
      </StylesProvider>,
      this.mountPoint
    );
  }

  firstUpdated() {
    this.mountPoint = this.shadowRoot.getElementById('mountPoint');
    this.renderElement();
    retargetEvents(this.shadowRoot);
  }

  updated(changedProperties){
    if(changedProperties)
      this.renderElement();
  }

}

window.customElements.define('lit-react-wrapper', LitReactWrapper);
