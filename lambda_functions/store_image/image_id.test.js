const getImageId = require('./image_id.js');

test('albums/2001/image.jpg', () => {
    expect(getImageId("albums/2001/image.jpg")).toBe("2001/image.jpg");
});

test('albums/2001/12-31/image.jpg', () => {
    expect(getImageId("albums/2001/12-31/image.jpg")).toBe("2001/12-31/image.jpg");
});