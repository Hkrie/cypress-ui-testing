import {useCallback, useLayoutEffect, useState} from "react";


function getSize(el: any) {
    if (!el) {
        return {
            width: 0,
            height: 0
        }
    }

    return {
        width: el.offsetWidth,
        height: el.offsetHeight
    }
}

function useComponentSize(ref: any) {
    var _useState = useState(getSize(ref ? ref.current : {}))
    var ComponentSize = _useState[0]
    var setComponentSize = _useState[1]

    var handleResize = useCallback(
        function handleResize() {
            if (ref.current) {
                setComponentSize(getSize(ref.current))
            }
        },
        [ref]
    )

    useLayoutEffect(
        function() {
            if (!ref.current) {
                return
            }

            handleResize()

            // @ts-ignore
            if (typeof ResizeObserver === 'function') {
                // @ts-ignore
                var resizeObserver = new ResizeObserver(function() {
                    handleResize()
                })
                resizeObserver.observe(ref.current)

                return function() {
                    resizeObserver.disconnect()
                    resizeObserver = null
                }
            } else {
                window.addEventListener('resize', handleResize)

                return function() {
                    window.removeEventListener('resize', handleResize)
                }
            }
        },
        [ref.current]
    )

    return ComponentSize
}

export default useComponentSize;
