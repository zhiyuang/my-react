export interface HostConfig {
	createTextInstance: (content: string) => any;
	createInstance: (_type: string) => any;
	appendInitialChild: (parent: any, child: any) => any;
	appendChildToContainer: (child: any, parent: any) => any;
}

export class FiberRootNode {}

export class Reconciler {
	hostConfig: HostConfig;

	constructor(hostConfig: HostConfig) {
		this.hostConfig = hostConfig;
	}

	createContainer(container: any) {
		console.log(container);
		return new FiberRootNode();
	}

	updateContainer(element: any, root: any) {
		console.log(element, root);
		const div = document.createElement('div');
		div.appendChild(document.createTextNode('123'));
		document.body.appendChild(div);
	}
}

export default {};
