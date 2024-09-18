import { Props, ReactElement } from 'shared/ReactTypes';
import { FiberNode } from './fiber';
import { Flags } from './fiberFlags';
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { WorkTag } from './workTags';

function ChildReconciler(shouldTrackEffect: boolean) {
	function deleteChild(returnFiber: FiberNode, childToDelete: FiberNode) {
		if (!shouldTrackEffect) {
			return;
		}

		const deletions = returnFiber.deletions;
		if (deletions === null) {
			returnFiber.deletions = [childToDelete];
			returnFiber.flags |= Flags.ChildDeletion;
		} else {
			deletions.push(childToDelete);
		}
	}

	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFirstChild: FiberNode | null,
		element: ReactElement
	) {
		const key = element.key;
		if (currentFirstChild !== null) {
			if (currentFirstChild.key === key) {
				if (element.$$typeof === REACT_ELEMENT_TYPE) {
					if (currentFirstChild._type === element.type) {
						// type相同 可以复用
						const existing = useFiber(currentFirstChild, element.props);
						existing._return = returnFiber;

						return existing;
					}
					// type不同，删除旧的
					deleteChild(returnFiber, currentFirstChild);
				}
			} else {
				deleteChild(returnFiber, currentFirstChild);
			}
		}

		const fiber = FiberNode.createFiberFromElement(element);
		fiber._return = returnFiber;
		// console.log(999999, fiber);
		return fiber;
	}

	function reconcileSingleTextNode(
		returnFiber: FiberNode,
		currentFirstChild: FiberNode | null,
		content: string
	) {
		// 前：b 后：a
		// TODO 前：abc 后：a
		// TODO 前：bca 后：a
		if (
			currentFirstChild !== null &&
			currentFirstChild.tag === WorkTag.HostText
		) {
			const existing = useFiber(currentFirstChild, { content });
			existing._return = returnFiber;
			return existing;
		}
		if (currentFirstChild !== null) {
			deleteChild(returnFiber, currentFirstChild);
		}

		const created = new FiberNode(WorkTag.HostText, { content }, null);
		created._return = returnFiber;
		return created;
	}

	function placeSingleChild(fiber: FiberNode) {
		if (shouldTrackEffect && fiber.alternate === null) {
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
		if (typeof newChild === 'string' || typeof newChild === 'number') {
			return placeSingleChild(
				reconcileSingleTextNode(returnFiber, currentFirstChild, newChild + '')
			);
		}
		return null;
	}

	return reconcileChildFibers;
}

const useFiber = (fiber: FiberNode, pendingProps: Props): FiberNode => {
	const clone = fiber.createWorkInProgress(pendingProps);
	clone.index = 0;
	clone.sibling = null;

	return clone;
};

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
