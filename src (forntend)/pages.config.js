import Home from './pages/Home';
import Landing from './pages/Landing';
import ChatRooms from './pages/ChatRooms';
import Topics from './pages/Topics';
import PDFQa from './pages/PDFQa';
import Canvas from './pages/Canvas';
import __Layout from './Layout.jsx';

export const PAGES = {
    "Landing": Landing,
    "Assistant": Home,
    "Rooms": ChatRooms,
    "Topics": Topics,
    "PDF": PDFQa,
    "Canvas": Canvas,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};