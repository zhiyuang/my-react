import { FiberRootNode, Reconciler } from 'react-reconciler';

export default class Renderer {
	private root: FiberRootNode;
	private reconciler: Reconciler;

	constructor(root: FiberRootNode, reconciler: Reconciler) {
		this.root = root;
		this.reconciler = reconciler;
	}

	public render(element: any) {
		this.reconciler.updateContainer(element, this.root);
	}
}
