import '@fontsource-variable/cairo';
import { render } from 'preact';
import { App } from './app/App';
import './styles/global.css';

const appRoot = document.querySelector<HTMLDivElement>('#app');

if (!appRoot) {
  throw new Error('تعذر العثور على جذر واجهة معين.');
}

render(<App />, appRoot);
