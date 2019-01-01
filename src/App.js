import classnames from 'classnames';
import React, { useEffect, useState } from 'react';
import Diagram from './Diagram';
import Search from './Search';

export default function App() {
    const [data, setData] = useState({ data: {}, searchResults: [] });
    const [sortMode, setSortMode] = useState('folder');

    useEffect(() => {
        chrome.runtime.sendMessage({ command: 'getBookmarks' });
        chrome.runtime.onMessage.addListener((request) => {
            switch (request.type) {
            case 'getBookmarks':
                setData({ data: request.data, searchResults: [] });
                break;
            case 'searchBookmarks':
                setData({ data: request.data, searchResults: request.searchResults });
                break;
            default:
                break;
            }
        });
    }, []);

    const onQueryChange = (query) => {
        chrome.runtime.sendMessage({ command: 'searchBookmarks', query });
    };

    const classes = selected => classnames({
        'bookmarks-sort-control__item': true,
        'bookmarks-sort-control__item--selected': selected
    });

    return (
        <div className="bookmarks-container">
            <Diagram className="bookmarks-diagram" data={data} sortMode={sortMode} />
            <Search className="bookmarks-search" onChange={onQueryChange} />
            <div className="bookmarks-help">
                [ Type to search. Scroll to zoom. ]
            </div>
            <div className="bookmarks-sort-control">
                <div className="bookmarks-sort-control__item">Sort by:</div>
                <div className={classes(sortMode === 'folder')} onClick={() => setSortMode('folder')}>
                    Folder
                </div>
                <div className={classes(sortMode === 'domain')} onClick={() => setSortMode('domain')}>
                    Domain
                </div>
            </div>
        </div>
    );
}
