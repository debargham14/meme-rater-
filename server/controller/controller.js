const UploadModel = require('../model/schema');
const fs = require ('fs');

exports.home = async (req, res) => {
    const all_images = await UploadModel.find()
    res.render ('main', {images: all_images});
}

//to update the upvote count in the meme
exports.updateVotes = (req, res, next) => {
    // console.log ('I am here');
    const action = req.body.action;
    if(action == 'Upvote'){
        UploadModel.updateOne({_id: req.params.id}, {$inc: {upvotes: 1}}, {}, (err, numberAffected) => {
            res.send('');
        });
    }
    else {
        UploadModel.updateOne({_id: req.params.id}, {$inc: {downvotes: 1}}, {}, (err, numberAffected) => {
            res.send('');
        });
    }
}


exports.uploads = (req, res, next) => {
    const files = req.files;
    const username = req.body.username;
    if(!files){
        const error = new Error('please choose files');
        error.httpStatusCode = 400;
        return next(error);
    }

    //convert images into base64 encoding 
    let imgArray = files.map((file) => {
        let img = fs.readFileSync(file.path)
        return encode_image = img.toString('base64')
    })

    let result = imgArray.map((src, index) => {
        //create object to store data in the database
        let finalImg = {
            username: username,
            filename: files[index].originalname,
            contentType: files[index].mimetype,
            imageBase64: src
        }
        let newUpload = new UploadModel (finalImg);
        return newUpload
            .save()
            .then(() => {
                return {msg: `${files[index].originalname} Uploaded Successfully..!` }
            })
            .catch (error => {
                if(error){
                    if(error.name === `MongoError` && error.code === 11000)
                        return Promise.reject ({error: `Duplicate ${files[index].originalname}.file already exists...!`})
                }
                return Promise.reject ({error: error.message || `Cannot Upload ${files[index].originalname} something missing`})
            })
    });

    Promise.all(result)
        .then(msg => {
            res.redirect('/');
        })
        .catch (err => {
            res.json(err)
        })
    
}