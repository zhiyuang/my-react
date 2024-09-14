import { Reconciler } from 'react-reconciler';
import Renderer from './renderer';
import ReactDomHostConfig from './hostConfig';

export function createRoot(container: HTMLElement): Renderer {
	const reconciler = new Reconciler(ReactDomHostConfig);
	const root = reconciler.createContainer(container);
	const renderer = new Renderer(root, reconciler);

	return renderer;
}
