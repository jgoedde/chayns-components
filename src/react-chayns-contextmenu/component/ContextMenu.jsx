/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import * as ReactDOM from 'react-dom';
import Icon from '../../react-chayns-icon/component/Icon';

export default class ContextMenu extends Component {
    static propTypes = {
        hide: PropTypes.bool,
        onLayerClick: PropTypes.func,
        coordinates: PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired,
        }),
        items: PropTypes.arrayOf(PropTypes.shape({
            className: PropTypes.string,
            onClick: PropTypes.func,
            text: PropTypes.string.isRequired,
            icon: PropTypes.object,
        })),
        position: PropTypes.number, /** 0 = top right, 1 = bottom right, 2 = bottom left, 3 = top left */
        parent: PropTypes.node,
        children: PropTypes.node,
        onChildrenClick: PropTypes.func,
        childrenStyle: PropTypes.object,
    };

    static defaultProps = {
        hide: true,
        onLayerClick: null,
        items: [],
        position: 0,
        parent: document.getElementsByClassName('tapp')[0],
        children: null,
        coordinates: null,
        onChildrenClick: null,
        childrenStyle: null,
    };

    constructor() {
        super();
        this.state = { displayNone: true, hide: true };
        this.getCoordinates = this.getCoordinates.bind(this);
        this.onChildrenClick = this.onChildrenClick.bind(this);
        this.onLayerClick = this.onLayerClick.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        const { hide } = this.props;
        if (nextProps.hide && !hide) {
            this.setState({ hide: true });
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.setState({ displayNone: true });
            }, 350);
        } else if (!nextProps.hide && hide) {
            this.setState({ displayNone: false });
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.setState({ hide: false });
            }, 50);
        }
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    onChildrenClick(e) {
        const { onChildrenClick } = this.props;
        if (onChildrenClick) {
            onChildrenClick(e);
        } else {
            this.setState({ displayNone: false });
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.setState({ hide: false });
            }, 50);
        }
    }

    onLayerClick(e) {
        const { onLayerClick } = this.props;
        if (onLayerClick) {
            onLayerClick(e);
        } else {
            this.setState({ hide: true });
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.setState({ displayNone: true });
            }, 350);
        }
    }

    getCoordinates() {
        const { coordinates, position } = this.props;

        if (coordinates) {
            return coordinates;
        }
        if (this.childrenNode) {
            const rect = this.childrenNode.getBoundingClientRect();
            return {
                x: rect.x + (rect.width / 2),
                y: (position === 1 || position === 2) ? rect.y + rect.height : rect.y,
            };
        }
        return { x: 0, y: 0 };
    }

    render() {
        const {
            items, position, parent, children, childrenStyle, coordinates
        } = this.props;

        const { displayNone, hide } = this.state;
        const { x, y } = this.getCoordinates();

        return [
            ReactDOM.createPortal(
                <div
                    className={classNames('context-menu-overlay', {
                        'context-menu-overlay--hide': hide && displayNone,
                        'context-menu-overlay--active': !hide,
                    })}
                    onClick={this.onLayerClick}
                >
                    <ul
                        style={{
                            left: x,
                            top: y,
                        }}
                        className={classNames('context-menu', `context-menu--position${position}`, { 'context-menu--active': !hide })}
                    >
                        {items.map(item => (
                            <li
                                className={classNames('context-menu__item', item.className)}
                                onClick={item.onClick}
                                key={item.text}
                            >
                                {
                                    item.icon
                                        ? <div className="context-menu__item__icon"><Icon icon={item.icon}/></div>
                                        : null
                                }
                                {item.text}
                            </li>
                        ))}
                    </ul>
                </div>,
                parent
            ),
            coordinates
                ? null
                : (
                    <div
                        key="cc__contextMenu__children"
                        // eslint-disable-next-line no-return-assign
                        ref={ref => this.childrenNode = ref}
                        onClick={this.onChildrenClick}
                        style={childrenStyle}
                    >
                        {children}
                    </div>
                )
        ];
    }
}
