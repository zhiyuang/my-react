import { HostConfig } from 'react-reconciler';

const ReactDomHostConfig: HostConfig = {
	createTextInstance: (content: string) => {
		return document.createTextNode(content);
	},

	createInstance: (type: string) => {
		return document.createElement(type);
	},

	appendInitialChild(parent, child) {
		console.log('append initial child', parent, child);
		parent.appendChild(child);
	},

	appendChildToContainer(child, parent) {
		console.log('append child to container', child, parent);
	}
};

export default ReactDomHostConfig;
