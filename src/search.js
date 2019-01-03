import _ from 'lodash';
import classnames from 'classnames';
import React, { useState, useEffect } from 'react';

const keys = {
    BACKSPACE: 8,
    SPACE: 32,
    ESCAPE: 27,
    DELETE: 46
};

const isTypeable = keyCode => /[a-zA-Z0-9-_]/.test(String.fromCharCode(keyCode));

export default function Search(props) {
    const { className, onChange } = props;
    const [query, setQuery] = useState('');
    const [visible, setVisible] = useState(false);
    let timerId = null;

    const classes = classnames({
        [className]: true,
        [`${className}--visible`]: visible
    });

    const hideSearch = _.debounce(() => setVisible(false), 1000);

    useEffect(() => {
        document.body.addEventListener('keydown', (event) => {
            if ([keys.BACKSPACE, keys.SPACE].includes(event.keyCode)) event.preventDefault();
            switch (event.keyCode) {
            case keys.BACKSPACE:
                setQuery((prevQuery) => {
                    const newQuery = prevQuery.slice(0, -1);
                    onChange(newQuery);
                    return newQuery;
                });
                break;
            case keys.SPACE:
                setQuery((prevQuery) => {
                    const newQuery = `${prevQuery} `;
                    onChange(newQuery);
                    return newQuery;
                });

                break;
            case keys.ESCAPE:
            case keys.DELETE:
                setQuery('');
                onChange('');
                break;
            default:
                if (isTypeable(event.keyCode)) {
                    setVisible(true);
                    hideSearch();
                    setQuery((prevQuery) => {
                        const newQuery = `${prevQuery}${String.fromCharCode(event.keyCode)}`;
                        onChange(newQuery);
                        return newQuery;
                    });
                }
            }
        });
    }, []);

    return <div className={classes}>{query}</div>;
}
