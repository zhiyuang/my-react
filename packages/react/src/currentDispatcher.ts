import { Action } from 'shared/ReactTypes';

export type Dispatcher = {
	useState: <T>(initialState: (() => T) | T) => [T, Dispatch<T>];
};

export type Dispatch<State> = (action: Action<State>) => void;

const currentDispatcher: { current: null | Dispatcher } = {
	current: null
};

export const resolveDispatcher = () => {
	const dispatcher = currentDispatcher.current;
	console.log(777, currentDispatcher);
	if (dispatcher === null) {
		console.error('resolve dispatcher时dispatcher不存在');
	}
	return dispatcher;
};

export default currentDispatcher;
