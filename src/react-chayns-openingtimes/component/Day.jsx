import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import TimeSpan from './TimeSpan';
import Checkbox from '../../react-chayns-checkbox/component/Checkbox';
import Icon from '../../react-chayns-icon/component/Icon';
import ChooseButton from '../../react-chayns-button/component/ChooseButton';

class Day extends Component {
    constructor(props) {
        super(props);

        this.onDayActivation = this.onDayActivation.bind(this);
        this.timeSpanKey1 = Math.random().toString();
        this.timeSpanKey2 = Math.random().toString();

        this.state = { isRemoving: false, animations: false, isInvalid: false };
    }

    onDayActivation(status) {
        const {
            onDayActivation,
            weekday,
        } = this.props;

        onDayActivation(weekday.number, status);
    }

    animationendFunction = () => {
        const {
            weekday,
            onRemove,
        } = this.props;
        onRemove(weekday.number, 1);
        this.setState({ isRemoving: false });
        if (this.timeSpanRef) this.timeSpanRef.removeEventListener('animationend', this.animationendFunction);
    };

    onChange = (weekDayNumber, index, start, end) => {
        const {
            times,
            onChange,
        } = this.props;
        let isInvalid = false;
        if (times.length > 1) {
            const otherTime = times[times.length - 1 - index];
            const {
                hours: newStartHours,
                minutes: newStartMinutes,
            } = TimeSpan.getDataFromTimeString(start);
            const {
                hours: newEndHours,
                minutes: newEndMinutes,
            } = TimeSpan.getDataFromTimeString(end);

            const {
                hours: otherStartHours,
                minutes: otherStartMinutes,
            } = TimeSpan.getDataFromTimeString(otherTime.start);
            const {
                hours: otherEndHours,
                minutes: otherEndMinutes,
            } = TimeSpan.getDataFromTimeString(otherTime.end);
            if (index === 0 && (newEndHours > otherStartHours || (newEndHours === otherStartHours && newEndMinutes > otherStartMinutes))) {
                isInvalid = true;
            }
            if (index === 1 && (otherEndHours > newStartHours || (newStartHours === otherEndHours && otherEndMinutes > newStartMinutes))) {
                isInvalid = true;
            }
        }

        this.setState({
            isInvalid,
        });
        onChange(weekDayNumber, index, start, end, isInvalid);
    };

    render() {
        const {
            weekday,
            times,
            onAdd,
        } = this.props;

        const { isRemoving, animations, isInvalid } = this.state;

        // eslint-disable-next-line no-nested-ternary
        const timeSpans = times.slice();
        const isDisabled = !times.some((t) => !t.disabled);
        return (
            <div
                className={classNames('flex', 'times', {
                    multiple: timeSpans.length > 1,
                    'multiple--animations': animations && timeSpans.length > 1,
                    isRemoving,
                    'times--disabled': isDisabled,
                })}
            >
                <div className="flex__left">
                    <Checkbox
                        label={weekday.name}
                        onChange={this.onDayActivation}
                        checked={!isDisabled}
                    />
                </div>
                <div className="flex__middle">
                    {
                        timeSpans.map((t, index) => (
                            <TimeSpan
                                key={index === 0 ? this.timeSpanKey1 : this.timeSpanKey2}
                                start={t.start}
                                end={t.end}
                                disabled={isDisabled}
                                onChange={(start, end) => this.onChange(weekday.number, index, start, end)}
                                childrenRef={index === 1 ? (ref) => {
                                    this.timeSpanRef = ref;
                                } : null}
                                isInvalid={isInvalid}
                            />
                        ))
                    }
                </div>
                <ChooseButton
                    className="flex__right"
                    onClick={() => {
                        this.setState({ animations: true });
                        if (this.timeSpanRef) this.timeSpanRef.removeEventListener('animationend', this.animationendFunction);
                        if (timeSpans.length < 2) {
                            onAdd(weekday.number, TimeSpan.defaultStart, TimeSpan.defaultEnd);
                        } else {
                            this.timeSpanRef.addEventListener('animationend', this.animationendFunction);
                            this.setState({ isRemoving: true });
                        }
                    }}
                >
                    <Icon
                        icon={timeSpans.length < 2 || isRemoving ? 'fa fa-plus' : 'fa fa-times'}
                        style={{ fontSize: 'inherit' }}
                    />
                </ChooseButton>
            </div>
        );
    }
}

Day.propTypes = {
    weekday: PropTypes.shape({
        name: PropTypes.string.isRequired,
        number: PropTypes.number.isRequired,
    }).isRequired,
    times: PropTypes.arrayOf(PropTypes.shape({
        start: PropTypes.string.isRequired,
        end: PropTypes.string.isRequired,
    })).isRequired,
    onDayActivation: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
};

Day.displayName = 'Day';

export default Day;
