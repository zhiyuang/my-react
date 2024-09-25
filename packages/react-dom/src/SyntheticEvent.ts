import { Container } from './hostConfig';

const validEventTypeList = ['click'];
const elementEventPropsKey = '__props';

type EventCallback = (e: SyntheticEvent) => void;

interface Paths {
	capture: EventCallback[];
	bubble: EventCallback[];
}

interface SyntheticEvent extends Event {
	type: string;
	__stopPropagation: boolean;
}

export interface PackagedElement extends Element {
	[elementEventPropsKey]: {
		[eventType: string]: EventCallback;
	};
}

const getEventCallbackNameFromEventType = (
	eventType: string
): string[] | undefined => {
	return {
		click: ['onClickCapture', 'onClick']
	}[eventType];
};

export const updateEventProps = (
	node: Element,
	props: any
): PackagedElement => {
	(node as PackagedElement)[elementEventPropsKey] =
		(node as PackagedElement)[elementEventPropsKey] || {};

	validEventTypeList.forEach((eventType) => {
		const callbackNameList = getEventCallbackNameFromEventType(eventType);
		if (!callbackNameList) {
			return;
		}
		callbackNameList.forEach((callbackName) => {
			if (Object.hasOwnProperty.call(props, callbackName)) {
				(node as PackagedElement)[elementEventPropsKey][callbackName] =
					props[callbackName];
			}
		});
	});
	return node as PackagedElement;
};

const collectPaths = (
	targetElement: PackagedElement,
	container: Container,
	eventType: string
): Paths => {
	const paths: Paths = {
		capture: [],
		bubble: []
	};

	while (targetElement && targetElement !== container) {
		const eventProps = targetElement[elementEventPropsKey];
		if (eventProps) {
			const callbackNameList = getEventCallbackNameFromEventType(eventType);
			if (callbackNameList) {
				callbackNameList.forEach((callbackName, i) => {
					const eventCallback = eventProps[callbackName];
					if (eventCallback) {
						if (i === 0) {
							paths.capture.unshift(eventCallback);
						} else {
							paths.bubble.push(eventCallback);
						}
					}
				});
			}
			targetElement = targetElement.parentNode as PackagedElement;
		}
	}

	return paths;
};

const dispatchEvent = (container: Container, eventType: string, e: Event) => {
	const targetElement = e.target;

	if (targetElement === null) {
		console.error('event has no target', e);
		return;
	}

	const { capture, bubble } = collectPaths(
		targetElement as PackagedElement,
		container,
		eventType
	);

	const se = createSyntheticEvent(e);

	triggerEventFlow(capture, se);

	if (!se.__stopPropagation) {
		triggerEventFlow(bubble, se);
	}
};

const createSyntheticEvent = (e: Event): SyntheticEvent => {
	const syntheticEvent = e as SyntheticEvent;
	syntheticEvent.__stopPropagation = false;
	const originStopPropagation = e.stopPropagation;

	syntheticEvent.stopPropagation = () => {
		syntheticEvent.__stopPropagation = true;
		if (originStopPropagation) {
			originStopPropagation();
		}
	};

	return syntheticEvent;
};

const triggerEventFlow = (paths: EventCallback[], se: SyntheticEvent) => {
	for (let i = 0; i < paths.length; i++) {
		const callback = paths[i];
		callback.call(null, se);
		if (se.__stopPropagation) {
			break;
		}
	}
};

export const initEvent = (container: Container, eventType: string) => {
	container.addEventListener(eventType, (e) => {
		dispatchEvent(container, eventType, e);
	});
};
