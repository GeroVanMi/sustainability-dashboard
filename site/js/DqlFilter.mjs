
export function mainQuery(queryObj) {
    const helper = buildFilterMain(queryObj);

    return `query {
${helper.handler}
${mainSelector(helper.filter)}
}`;
}

export function objectsQuery(category, limit, offset, queryObj) {
    const helper = buildFilterMain(queryObj);

    return `query {
${helper.handler}
${objectSelector(category, limit, offset, helper.filter)}
}`;
}

export function peopleQuery(category, limit, offset, queryObj) {
    const helper = buildFilterMain(queryObj);

    return `query {
${helper.handler}
${personSelector(category, limit, offset, helper.filter)}
}`;
}

export function statQuery(category, queryObj) {
    const helper = buildFilterMain(queryObj);

    return `query {
${helper.handler}
${statSelector(category, helper.filter)}
}`;
}

function buildFilterMain(queryObj) {
    if (!queryObj) {
        return {};
    }

    const aFilter = [];
    const aHandler = [];

    if (queryObj.sdgs && queryObj.sdgs.length) {
        queryObj.sdgs.forEach((t, i) => {
            aFilter.push(buildUidFilter("sdg", i));
            aHandler.push(buildEdgeHandler("sdg", t, i));
        });
    }

    if (queryObj.departments && queryObj.departments.length) {
        queryObj.departments.forEach((t, i) => {
            aFilter.push(buildUidFilter("department", i));
            aHandler.push(buildEdgeHandler("department", t, i));
        });
    }

    if (queryObj.persons && queryObj.persons.length) {
        queryObj.persons.forEach((t, i) => {
            aFilter.push(buildUidFilter("person", i));
            aHandler.push(buildPersonHandler(t, i));
        });
    }

    if (queryObj.lang && queryObj.lang.length) {
        queryObj.lang.forEach((t) => {
            aFilter.push(buildLangFilter(t));
        });
    }

    if (queryObj.terms && queryObj.terms.length) {
        queryObj.terms.forEach((t) => {
            aFilter.push(buildTermFilter("term", t));
        });
    }

    if (queryObj.notterms && queryObj.notterms.length) {
        queryObj.notterms.forEach((t) => {
            aFilter.push(buildTermFilter("notterm", t));
        });
    }

    const filter = aFilter.join(" and ");
    const handler = aHandler.join("\n    ");

    return {
        filter,
        handler
    };
}

function mainSelector(filter) {
    filter = (filter && filter.length) ? ` @filter(${filter})` : "";


    const aHelper = filter.length ? `aph as var(func: type(Author)) @cascade { Author.objects${filter} { uid } }` : "";
    const pHelper = filter.length ? " @filter(uid_in(Person.pseudonyms, uid(aph)))" : "";

    return `
    ${aHelper}
    infoobjecttype(func: type(InfoObjectType)) {
        name: InfoObjectType.name
        n: count(InfoObjectType.objects${filter})
    }
      
    people(func: has(Person.pseudonyms))${pHelper} {
        n: count(uid)
    }
`;
}

function statSelector(category, filter) {
    filter = (filter && filter.length) ? ` and ${filter}` : "";
    return `
    categ as var(func: type(InfoObjectType)) @filter(eq(InfoObjectType.name, ${JSON.stringify(category)})) {
        uid
    }

    sdg(func: type(Sdg)) {
        id: Sdg.id
        n: count(Sdg.objects @filter(uid_in(InfoObject.category, uid(categ))${filter}))
    }

    department(func:type(Department)) {
        id: Department.id
        n: count(Department.objects @filter(uid_in(InfoObject.category, uid(categ))${filter}))
    }
`;
}

function personSelector(category, limit, offset, filter) {
    filter = (filter && filter.length) ? ` and ${filter}` : "";
    return `
        categ as var(func: type(InfoObjectType)) @filter(eq(InfoObjectType.name, ${JSON.stringify(category)})) {
            uid
        }

        pps as var(func: has(Person.pseudonyms))
          {
            Person.pseudonyms {
        		np as count(Author.objects 
                    # filter
                    @filter(uid_in(InfoObject.category, uid(categ))${filter}) 
                )
            }
            tmpn as sum(val(np))
        }

        contributors(func: uid(pps)) {
            n: count(uid)
        }

        person(func: uid(pps), orderdesc: val(tmpn), first: ${limit}, offset: ${offset}) @filter(gt(val(tmpn), 0)){
            initials: Person.initials
            surname: Person.surname
            givenname: Person.givenname
            displayname: Person.displayname
            mail: Person.mail
            department: Person.department {
                id: Department.id
            }
            n: val(tmpn)
        }
`;
}

function objectSelector(category, limit, offset, filter) {
    filter = (filter && filter.length) ? ` @filter(${filter})` : "";

    return `
    category(func: eq(InfoObjectType.name, ${JSON.stringify(category)})) {
        objects: InfoObjectType.objects(first: ${limit}, offset: ${offset},  orderdesc: InfoObject.year) 
        ${filter}
        {
          link: InfoObject.link
          title: InfoObject.title
          abstract: InfoObject.abstract
          extras: InfoObject.extras
          year: InfoObject.year
          authors: InfoObject.authors {
            fullname: Author.fullname
            person: Author.person {
                qvalue.person: Person.initials
                firstname: Person.givenname
                lastname: Person.surname
                displayname: Person.displayname
                department.affiliation: Person.department {
                    id: Department.id
                }
            }
          }
          department: InfoObject.departments {
            id: Department.id
          }
          sdg: InfoObject.sdgs {
            id: Sdg.id
          }
          keywords: InfoObject.keywords {
            name: Keyword.name
          }
          subtype: InfoObject.subtype {
            name: InfoObjectSubType.name 
          }
          classification: InfoObject.class { 
            itemid: PublicationClass.id 
            name: PublicationClass.name 
          }
        }
    }
`;
}

function buildPersonHandler(author, id) {
    return `ph${id} as var(func: has(Author.person)) @cascade { 
        Author.person @filter(eq(Person.initials, ${author})) {
            uid
        }
    }`;
}

function buildEdgeHandler(type, value, id) {
    const firstChar = type.trim().charAt(0);

    const realType = firstChar.toUpperCase() + type.slice(1);

    return `${firstChar}h${id} as var(func: type(${realType})) @filter(eq(${realType}.id, ${value})) { uid }`;
}

function buildUidFilter(type, id) {
    const firstChar = type.trim().charAt(0);

    if (!["sdg", "department", "person"].includes(type)) {
        return "";
    }

    return `uid_in(InfoObject.${type === "person" ? "author" : type}s, uid(${firstChar}h${id}))`;
}

function buildTermFilter(type, term) {
    const not = (type !== "term");

    return `${not ? "not" : ""}(alloftext(InfoObject.title, ${term}) or alloftext(InfoObject.abstract, ${term}) or alloftext(InfoObject.extras, ${term}))`;
}

function buildLangFilter(lang) {
    return `eq(InfoObject.language, ${lang.toLowerCase()})`
}
