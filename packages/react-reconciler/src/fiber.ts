import { Props } from 'shared/ReactTypes';
import { Flags } from './fiberFlags';
import { UpdateQueue } from './updateQueue';
import { WorkTag } from './workTags';

type StateNode = any;

export class FiberRootNode {
	public container: any;
	public current: FiberNode | null;
	public finished_work?: FiberNode;

	constructor(container: any, current: FiberNode) {
		this.container = container;
		this.current = current;
	}
}

export class FiberNode {
	public tag: WorkTag;
	public key?: string;
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

	constructor(tag: WorkTag, pendingProps: Props, key?: string) {
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
}
