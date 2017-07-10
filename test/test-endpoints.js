const chai = require('chai');
const chaiHttp = require('chai-http');

const {
    app,
    runServer,
    closeServer
} = require('../server');

const should = chai.should();

chai.use(chaiHttp);

describe('BlogPosts', function () {
    before(function () {
        return runServer();
    });
    after(function () {
        return closeServer();
    });

    it('should show title, content, and author of blog posts', function () {
        return chai.request(app)
            .get('/blog-post')
            .then(function (res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.length.sould.be.above(0);
                res.body.forEach(function (item) {
                    item.should.be.a('object');
                    item.should.have.all.keys(
                        'id', 'title', 'content', 'author', 'publishDate');
                });
            });
    });
});

it('should add a blog post on POST', function () {
    const BlogPosts = {
        name: 'third post',
        content: 'content test',
        author: 'me',
    };
    return chai.request(app)
        .post('/blog-post')
        .send(BlogPosts)
        .then(function (res) {
            res.should.have.status(201);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.include.keys('id', 'title', 'content', 'author', 'publishDate');
            res.body.id.should.not.be.null;
            res.body.should.deep.equal(Object.assign(BlogPosts, {
                id: res.body.id
            }));
        });
});

it('should update blog posts on PUT', function () {
    const updateData = {
        title: 'third post',
        content: 'content test',
        author: 'me',
    };
    return chai.request(app)
        // first have to get so we have an idea of object to update
        .get('/blog-post')
        .then(function (res) {
            updateData.id = res.body[0].id;
            return chai.request(app)
                .put(`/blog-post/${updateData.id}`)
                .send(updateData)
        })
        .then(function (res) {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.deep.equal(updateData);
        });
});

it('should delete blog posts on DELETE', function () {
    return chai.request(app)

        // get recipe for the id first, then delte the item with the id
        .get('/blog-post')
        .then(function (res) {
            return chai.request(app)
                .delete(`/blog-post/${res.body[0].id}`);
        })
        .then(function (res) {
            res.should.have.status(204);
        });
});

let server;

function runServer() {
    const port = process.env.PORT || 8080;
    return new Promise((resolve, reject) => {
        server = app.listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve(server);
        })
            .on('error', err => {
            reject(err);
        });
    });
}

//... closeServer defined here

if (require.main === module) {
    runServer().catch(err => console.error(err));
};
