import { FiberRootNode, Reconciler } from 'react-reconciler';
import { initEvent } from './SyntheticEvent';

export default class Renderer {
	private root: FiberRootNode;
	private reconciler: Reconciler;

	constructor(root: FiberRootNode, reconciler: Reconciler) {
		this.root = root;
		this.reconciler = reconciler;
	}

	public render(element: any) {
		initEvent(this.root.container, 'click');
		this.reconciler.updateContainer(element, this.root);
	}
}
