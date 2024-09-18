import { FiberNode, FiberRootNode } from './src/fiber';
import {
	createUpdate,
	createUpdateQueue,
	enqueueUpdate,
	UpdateQueue
} from './src/updateQueue';
import { WorkTag } from './src/workTags';
import { ReactElement } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './src/workLoop';
export { FiberRootNode } from './src/fiber';
export { type HostConfig } from './src/hostConfig';

export class Reconciler {
	createContainer(
		container: any /** Reconciler 是和平台无关的，这里 container 可以是 HTMLElement，也可以是 React Native 的元素 */
	) {
		console.log(container);
		const hostRootFiber = new FiberNode(WorkTag.HostRoot, {}, null);
		hostRootFiber.updateQueue = createUpdateQueue<ReactElement>();
		const root = new FiberRootNode(container, hostRootFiber);
		hostRootFiber.stateNode = root;
		return root;
	}

	updateContainer(element: any, root: FiberRootNode) {
		const hostRootFiber = root.current as FiberNode;
		const update = createUpdate(element);
		enqueueUpdate(
			hostRootFiber.updateQueue as UpdateQueue<ReactElement>,
			update
		);
		scheduleUpdateOnFiber(hostRootFiber);
		console.log(3333333, hostRootFiber);
	}
}
