import React, { useRef, useEffect } from 'react';
import { init, update } from './d3Diagram';

let svg = null;

export default function Diagram(props) {
    const { className, data } = props;
    const element = useRef(null);

    useEffect(() => {
        svg = init(element.current);
    }, []);

    useEffect(() => {
        update({ svg, data: data.data, searchResults: data.searchResults });
    }, [JSON.stringify(data)]);

    return <div className={className} ref={element} />;
}
