import { ReactElement } from 'shared/ReactTypes';
import { FiberNode } from './fiber';
import { Flags } from './fiberFlags';
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';

function ChildReconciler(shouldTrackEffect: boolean) {
	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFirstChild: FiberNode | null,
		element: ReactElement
	) {
		currentFirstChild;
		const fiber = FiberNode.createFiberFromElement(element);
		fiber._return = returnFiber;
		console.log(999999, fiber);
		return fiber;
	}

	function placeSingleChild(fiber: FiberNode) {
		if (shouldTrackEffect) {
			fiber.flags |= Flags.Placement;
		}
		return fiber;
	}

	function reconcileChildFibers(
		returnFiber: FiberNode,
		currentFirstChild: FiberNode | null,
		newChild?: ReactElement
	) {
		if (typeof newChild === 'object' && newChild !== null) {
			switch (newChild.$$typeof) {
				case REACT_ELEMENT_TYPE:
					return placeSingleChild(
						reconcileSingleElement(returnFiber, currentFirstChild, newChild)
					);
			}
		}
		return null;
	}

	return reconcileChildFibers;
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
