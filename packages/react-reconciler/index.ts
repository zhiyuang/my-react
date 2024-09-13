import { FiberNode, FiberRootNode } from './src/fiber';
import {
	createUpdate,
	enqueueUpdate,
	initializeUpdateQueue
} from './src/updateQueue';
import WorkLoop from './src/workLoop';
import { WorkTag } from './src/workTags';
export { FiberRootNode } from './src/fiber';

export interface HostConfig {
	createTextInstance: (content: string) => any;
	createInstance: (_type: string) => any;
	appendInitialChild: (parent: any, child: any) => any;
	appendChildToContainer: (child: any, parent: any) => any;
}

export class Reconciler {
	hostConfig: HostConfig;

	constructor(hostConfig: HostConfig) {
		this.hostConfig = hostConfig;
	}

	createContainer(
		container: any /** Reconciler 是和平台无关的，这里 container 可以是 HTMLElement，也可以是 React Native 的元素 */
	) {
		console.log(container);
		const hostRootFiber = new FiberNode(WorkTag.HostRoot, null);
		initializeUpdateQueue(hostRootFiber);
		const root = new FiberRootNode(container, hostRootFiber);
		hostRootFiber.stateNode = root;
		return root;
	}

	updateContainer(element: any, root: FiberRootNode) {
		const hostRootFiber = root.current as FiberNode;
		const update = createUpdate(element);
		enqueueUpdate(hostRootFiber, update);
		const workLoop = new WorkLoop();
	}
}

