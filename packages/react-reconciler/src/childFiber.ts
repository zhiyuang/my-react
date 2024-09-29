import { Props, ReactElement } from 'shared/ReactTypes';
import { FiberNode } from './fiber';
import { Flags, Placement } from './fiberFlags';
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { WorkTag } from './workTags';

type ExistingChildren = Map<string | number, FiberNode>;

function ChildReconciler(shouldTrackEffects: boolean) {
	function deleteChild(returnFiber: FiberNode, childToDelete: FiberNode) {
		if (!shouldTrackEffects) {
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

	function deleteRemainingChildren(
		returnFiber: FiberNode,
		currentFirstChild: FiberNode | null
	) {
		if (!shouldTrackEffects) {
			return;
		}
		let childToDelete = currentFirstChild;
		while (childToDelete !== null) {
			deleteChild(returnFiber, childToDelete);
			childToDelete = childToDelete.sibling;
		}
	}

	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFirstChild: FiberNode | null,
		element: ReactElement
	) {
		const key = element.key;
		let current = currentFirstChild;
		while (current !== null) {
			if (current.key === key) {
				if (element.$$typeof === REACT_ELEMENT_TYPE) {
					if (current._type === element.type) {
						// type相同 可以复用
						const existing = useFiber(current, element.props);
						existing._return = returnFiber;

						deleteRemainingChildren(returnFiber, current.sibling);

						return existing;
					}
					// type不同，删除旧的
					deleteRemainingChildren(returnFiber, current);
					break;
				}
			} else {
				deleteChild(returnFiber, current);
				current = current.sibling;
			}
		}

		const fiber = FiberNode.createFiberFromElement(element);
		fiber._return = returnFiber;
		// console.log(999999, fiber);
		return fiber;
	}

	function updateFromMap(
		returnFiber: FiberNode,
		existingChildren: ExistingChildren,
		index: number,
		element: ReactElement | string
	): FiberNode | null {
		let keyToUse;
		if (typeof element === 'string') {
			keyToUse = index;
		} else {
			keyToUse = element.key !== null ? element.key : index;
		}
		const before = existingChildren.get(keyToUse);
		if (typeof element === 'string') {
			if (before) {
				existingChildren.delete(keyToUse);
				if (before.tag === WorkTag.HostText) {
					return useFiber(before, { content: element });
				} else {
					deleteChild(returnFiber, before);
				}
			}
		}

		if (typeof element === 'object' && element !== null) {
			switch (element.$$typeof) {
				case REACT_ELEMENT_TYPE:
					if (before) {
						existingChildren.delete(keyToUse);
						if (before._type === element.type) {
							return useFiber(before, element.props);
						} else {
							deleteChild(returnFiber, before);
						}
					}
					return FiberNode.createFiberFromElement(element);
			}
		}
		console.error('updateFromMap 未处理的情况', before, element);
		return null;
	}

	function reconcileSingleTextNode(
		returnFiber: FiberNode,
		currentFirstChild: FiberNode | null,
		content: string
	) {
		// 前：b 后：a
		// 前：abc 后：a
		// 前：bca 后：a
		let current = currentFirstChild;
		while (current !== null) {
			if (current.tag === WorkTag.HostText) {
				const existing = useFiber(current, { content });
				existing._return = returnFiber;
				deleteRemainingChildren(returnFiber, current.sibling);
				return existing;
			}

			deleteChild(returnFiber, current);
			current = current.sibling;
		}

		const created = new FiberNode(WorkTag.HostText, { content }, null);
		created._return = returnFiber;
		return created;
	}

	function placeSingleChild(fiber: FiberNode) {
		if (shouldTrackEffects && fiber.alternate === null) {
			fiber.flags |= Flags.Placement;
		}
		return fiber;
	}

	function reconcileChildrenArray(
		returnFiber: FiberNode,
		currentFirstChild: FiberNode | null,
		newChild: (ReactElement | string)[]
	) {
		// 遍历到的最后一个可复用fiber在before中的index
		let lastPlacedIndex = 0;
		// 创建的最后一个 fiber
		let lastNewFiber: FiberNode | null = null;
		// 创建的第一个 fiber
		let firstNewFiber: FiberNode | null = null;

		const existingChildren: ExistingChildren = new Map();
		let current = currentFirstChild;

		while (current !== null) {
			const keyToUse = current.key !== null ? current.key : current.index;
			existingChildren.set(keyToUse, current);
			current = current.sibling;
		}

		for (let i = 0; i < newChild.length; ++i) {
			const after = newChild[i];

			const newFiber = updateFromMap(
				returnFiber,
				existingChildren,
				i,
				after
			) as FiberNode;

			newFiber.index = i;
			newFiber._return = returnFiber;

			if (lastNewFiber === null) {
				lastNewFiber = firstNewFiber = newFiber;
			} else {
				lastNewFiber = (lastNewFiber.sibling as FiberNode) = newFiber;
			}

			if (!shouldTrackEffects) {
				continue;
			}

			const current = newFiber.alternate;
			if (current !== null) {
				const oldIndex = current.index;
				if (oldIndex < lastPlacedIndex) {
					newFiber.flags |= Flags.Placement;
				} else {
					lastPlacedIndex = oldIndex;
				}
			} else {
				newFiber.flags |= Placement;
			}
		}

		existingChildren.forEach((fiber) => {
			deleteChild(returnFiber, fiber);
		});

		return firstNewFiber;
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
			if (Array.isArray(newChild)) {
				return reconcileChildrenArray(returnFiber, currentFirstChild, newChild);
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
