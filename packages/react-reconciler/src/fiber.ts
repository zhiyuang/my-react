import { Key, Props, ReactElement } from 'shared/ReactTypes';
import { Flags } from './fiberFlags';
import { UpdateQueue } from './updateQueue';
import { WorkTag } from './workTags';

type StateNode = any;

export class FiberRootNode {
	public container: any;
	public current: FiberNode | null;
	public finishedWork: FiberNode | null;

	constructor(container: any, current: FiberNode) {
		this.container = container;
		this.current = current;
		this.finishedWork = null;
	}
}

export class FiberNode {
	public tag: WorkTag;
	public key: Key | null;
	public pendingProps: Props;
	public stateNode: StateNode;
	public updateQueue: UpdateQueue | null;
	public _return: FiberNode | null;
	public sibling: FiberNode | null;
	public child: FiberNode | null;
	public alternate: FiberNode | null;
	public _type: any;
	public flags: Flags;
	public subtreeFlags: Flags;
	public memoizedProps: Props | null;
	public memoizedState?: any;
	public finishedWork: FiberNode | null;

	constructor(tag: WorkTag, pendingProps: Props, key: Key | null) {
		this.tag = tag;
		this.pendingProps = pendingProps;
		this.key = key;
		this.flags = Flags.NoFlags;
		this.subtreeFlags = Flags.NoFlags;

		this.updateQueue = null;
		this._return = null;
		this.sibling = null;
		this.child = null;
		this.alternate = null;
		this.memoizedProps = null;
		this.finishedWork = null;
	}

	createWorkInProgress(pendingProps: Props) {
		let wip = this.alternate;

		if (wip === null) {
			wip = new FiberNode(this.tag, pendingProps, this.key);
			wip._type = this._type;
			wip.stateNode = this.stateNode;
			wip.alternate = this;
			this.alternate = wip;
		} else {
			wip.pendingProps = pendingProps;
		}

		wip.updateQueue = this.updateQueue;
		wip.flags = this.flags;
		wip.child = this.child;

		wip.memoizedProps = this.memoizedProps;
		wip.memoizedState = this.memoizedState;

		return wip;
	}

	static createFiberFromElement(element: ReactElement): FiberNode {
		const { type, key, props } = element;
		let fiberTag: WorkTag = WorkTag.FunctionComponent;

		if (typeof type === 'string') {
			fiberTag = WorkTag.HostComponent;
		}
		const fiber = new FiberNode(fiberTag, props, key);
		fiber._type = type;

		return fiber;
	}
}
