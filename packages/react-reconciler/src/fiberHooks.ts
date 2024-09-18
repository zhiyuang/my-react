import { FiberNode } from './fiber';
import sharedInternals from 'shared/internals';
import { Dispatcher, Disptach } from 'react/src/currentDispatcher';
import {
	createUpdate,
	createUpdateQueue,
	enqueueUpdate,
	UpdateQueue
} from './updateQueue';
import { Action } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './workLoop';

let workInProgressHook: Hook | null = null;
let currentlyRenderingFiber: FiberNode | null = null;

const { currentDispatcher } = sharedInternals;

interface Hook {
	memoizedState: any;
	updateQueue: unknown;

	next: Hook | null;
}

console.log(66, currentDispatcher);
export const renderWithHooks = (workInProgress: FiberNode) => {
	console.log(999999);
	currentlyRenderingFiber = workInProgress;

	workInProgress.memoizedProps = null;
	workInProgress.memoizedState = null;

	const current = workInProgress.alternate;
	if (current !== null) {
		console.error('update 还没实现');
	} else {
		currentDispatcher.current = HooksDispatcherOnMount;
	}

	const Component = workInProgress._type;
	const props = workInProgress.pendingProps;

	console.log(667, currentDispatcher);
	const children = Component(props);

	return children;
};

const HooksDispatcherOnMount: Dispatcher = {
	useState: mountState
};

function mountState<State>(
	initialState: (() => State) | State
): [State, Disptach<State>] {
	const hook = mountWorkInProgressHook();

	let memoizedState: State;
	if (initialState instanceof Function) {
		memoizedState = initialState();
	} else {
		memoizedState = initialState;
	}

	hook.memoizedState = memoizedState;

	if (currentlyRenderingFiber === null) {
		console.error('mountState时currentlyRenderingFiber不存在');
	}
	const queue = createUpdateQueue();
	hook.updateQueue = queue;

	return [
		memoizedState,
		// @ts-ignore
		dispatchSetState.bind(null, currentlyRenderingFiber, queue)
	];
}

function dispatchSetState<State>(
	fiber: FiberNode,
	updateQueue: UpdateQueue<State>,
	action: Action<State>
) {
	const update = createUpdate(action);
	enqueueUpdate(updateQueue, update);
	scheduleUpdateOnFiber(fiber);
}

const mountWorkInProgressHook = () => {
	const hook: Hook = {
		memoizedState: null,
		updateQueue: null,
		next: null
	};

	if (workInProgressHook === null) {
		if (currentlyRenderingFiber === null) {
			console.error('mountWorkInprogressHook时currentlyRenderingFiber未定义');
		} else {
			currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
		}
	} else {
		workInProgressHook = workInProgressHook.next = hook;
	}

	return workInProgressHook as Hook;
};
