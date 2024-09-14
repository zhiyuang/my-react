import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';

const jsx = (type: string, props: any, key: string | number) => {
	return {
		$$typeof: REACT_ELEMENT_TYPE,
		type,
		props,
		key,
		ref: null
	};
};

export const jsxDEV = jsx;
