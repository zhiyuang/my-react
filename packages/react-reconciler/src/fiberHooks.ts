import { FiberNode } from './fiber';
import sharedInternals from 'shared/internals';
import { Dispatcher, Dispatch } from 'react/src/currentDispatcher';
import {
	createUpdate,
	createUpdateQueue,
	enqueueUpdate,
	processUpdateQueue,
	UpdateQueue
} from './updateQueue';
import { Action } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './workLoop';

let workInProgressHook: Hook | null = null;
let currentHook: Hook | null = null;
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
		currentDispatcher.current = HooksDispatcherOnUpdate;
	} else {
		currentDispatcher.current = HooksDispatcherOnMount;
	}

	const Component = workInProgress._type;
	const props = workInProgress.pendingProps;

	console.log(667, currentDispatcher);
	const children = Component(props);

	currentlyRenderingFiber = null;
	workInProgressHook = null;
	currentHook = null;

	return children;
};

const HooksDispatcherOnMount: Dispatcher = {
	useState: mountState
};

const HooksDispatcherOnUpdate: Dispatcher = {
	useState: updateState
};

function mountState<State>(
	initialState: (() => State) | State
): [State, Dispatch<State>] {
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

	const dispatch = (queue.dispatch = dispatchSetState.bind(
		null,
		currentlyRenderingFiber as FiberNode,
		queue
	));

	return [memoizedState, dispatch];
}

function updateState<State>(): [State, Dispatch<State>] {
	const hook = updateWorkInProgressHook();
	const queue = hook.updateQueue as UpdateQueue<State>;
	const baseState = hook.memoizedState;

	hook.memoizedState = processUpdateQueue(
		baseState,
		queue,
		currentlyRenderingFiber as FiberNode
	);

	return [hook.memoizedState, queue.dispatch as Dispatch<State>];
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

// TODO: 还没仔细研究
const updateWorkInProgressHook = () => {
	// 情况1:交互触发的更新，此时wipHook还不存在，复用 currentHook链表中对应的 hook 克隆 wipHook
	// 情况2:render阶段触发的更新，wipHook已经存在，使用wipHook
	let nextCurrentHook: Hook | null;
	let nextWorkInProgressHook: Hook | null;

	if (currentHook === null) {
		// 情况1 当前组件的第一个hook
		const current = (currentlyRenderingFiber as FiberNode).alternate;
		if (current !== null) {
			nextCurrentHook = current.memoizedState;
		} else {
			nextCurrentHook = null;
		}
	} else {
		nextCurrentHook = currentHook.next;
	}

	if (workInProgressHook === null) {
		// 情况2 当前组件的第一个hook
		nextWorkInProgressHook = (currentlyRenderingFiber as FiberNode)
			.memoizedState;
	} else {
		nextWorkInProgressHook = workInProgressHook.next;
	}

	if (nextWorkInProgressHook !== null) {
		// 针对情况2 nextWorkInProgressHook保存了当前hook的数据
		workInProgressHook = nextWorkInProgressHook;
		currentHook = nextCurrentHook;
	} else {
		// 针对情况1 nextCurrentHook保存了可供克隆的hook数据
		if (nextCurrentHook === null) {
			// 本次render当前组件执行的hook比之前多，举个例子：
			// 之前：hook1 -> hook2 -> hook3
			// 本次：hook1 -> hook2 -> hook3 -> hook4
			// 那到了hook4，nextCurrentHook就为null
			console.error(
				`组件${currentlyRenderingFiber?._type}本次执行的hook比上次多`
			);
		}
		currentHook = nextCurrentHook as Hook;
		const newHook: Hook = {
			memoizedState: currentHook.memoizedState,
			// 对于state，保存update相关数据
			updateQueue: currentHook.updateQueue,
			next: null
		};

		if (workInProgressHook === null) {
			(currentlyRenderingFiber as FiberNode).memoizedState =
				workInProgressHook = newHook;
		} else {
			workInProgressHook = workInProgressHook.next = newHook;
		}
	}
	return workInProgressHook as Hook;
};
