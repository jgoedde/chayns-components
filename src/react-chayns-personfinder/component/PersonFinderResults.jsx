import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { PERSON_RELATION, LOCATION_RELATION } from '../constants/relationTypes';
import PersonFinderResultItem from './PersonFinderResultItem';
import getText from '../utils/getText';
import Divider from './Divider';

export default class PersonFinderResults extends PureComponent {
    static propTypes = {
        persons: PropTypes.object,
        sites: PropTypes.object,
        onSelect: PropTypes.func,
        showSeparators: PropTypes.bool,
    };

    static defaultProps = {
        persons: { related: [], unrelated: [] },
        sites: { related: [], unrelated: [] },
        onSelect: null,
        showSeparators: false,
    };

    constructor(props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(value) {
        const { onSelect } = this.props;

        if (onSelect) {
            onSelect(value.type, value.relation);
        }
    }

    renderResults(relations, type) {
        if (relations.length === 0) {
            return null;
        }

        return relations.map(relation => (
            <PersonFinderResultItem
                key={relation.personId || relation.siteId}
                relation={relation}
                type={type}
                onClick={this.handleClick}
            />
        ));
    }

    render() {
        const { persons, sites, showSeparators } = this.props;

        const relatedPersons = this.renderResults(persons.related, PERSON_RELATION);
        const relatedSites = this.renderResults(sites.related, LOCATION_RELATION);
        const unrelatedPersons = this.renderResults(persons.unrelated, PERSON_RELATION);
        const unrelatedSites = this.renderResults(sites.unrelated, LOCATION_RELATION);

        return (
            <div className="cc__person-finder__results">
                {showSeparators && relatedPersons && relatedPersons.length > 0 && (
                    <Divider
                        key="related-persons"
                        name={getText('DIVIDER_PERSON')}
                    />
                )}
                {relatedPersons}
                {showSeparators && relatedSites && relatedSites.length > 0 && (
                    <Divider
                        key="related-sites"
                        name={getText('DIVIDER_SITE')}
                    />
                )}
                {relatedSites}
                {unrelatedPersons && unrelatedPersons.length > 0 && (
                    <Divider
                        key="unrelated-persons"
                        name={getText('DIVIDER_MORE_PERSON')}
                    />
                )}
                {unrelatedPersons}
                {unrelatedSites && unrelatedSites.length > 0 && (
                    <Divider
                        key="unrelated-sites"
                        name={getText('DIVIDER_MORE_SITE')}
                    />
                )}
                {unrelatedSites}
            </div>
        );
    }
}
