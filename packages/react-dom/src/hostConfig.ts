import { updateFiberProps } from './SyntheticEvent';

export type Container = Element | Document;
export type Instance = Element;
export type TextInstance = Text;

export const createTextInstance = (content: string) => {
	return document.createTextNode(content);
};

export const createInstance = (type: string, props: any) => {
	const element = document.createElement(type);
	return updateFiberProps(element, props);
};

export const insertChildToContainer = (
	child: Instance,
	container: Container,
	before: Instance
) => {
	container.insertBefore(before, child);
};

export const appendInitialChild = (parent: Instance, child: Instance) => {
	console.log('append initial child', parent, child);
	parent.appendChild(child);
};

export const appendChildToContainer = (child: Instance, parent: Container) => {
	console.log('append child to container', child, parent);
	parent.appendChild(child);
};

export const removeChild = (child: Instance, container: Container) => {
	container.removeChild(child);
};

export const commitTextUpdate = (
	textInstance: TextInstance,
	content: string
) => {
	textInstance.nodeValue = content;
};
