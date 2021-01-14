const templates = [
    {
        id: "c1",
        html: "c1.ejs",
        img: "c1.jpg",
        TitleLength: 32,
        NameLength: 70,
        DiscriptionLength: 1349,
    },
    {
        id: "c2",
        html: "c2.ejs",
        img: "c2.jpg",
        TitleLength: 32,
        NameLength: 70,
        DiscriptionLength: 1349,
    },
    {
        id: "c3",
        html: "c3.ejs",
        img: "c3.png",
        TitleLength: 32,
        NameLength: 70,
        DiscriptionLength: 1349,
    },
    {
        id: "c4",
        html: "c4.ejs",
        img: "c4.png",
        TitleLength: 32,
        NameLength: 92,
        DiscriptionLength: 933,
    },
    {
        id: "c5",
        html: "c5.ejs",
        img: "c5.png",
        TitleLength: 39,
        NameLength: 44,
        DiscriptionLength: 791,
    }
]
function find(id) {
    return templates.find(x => x.id === id);
}
module.exports = {
    templates: templates,
    find: find
}