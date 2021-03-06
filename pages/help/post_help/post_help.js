
const app = getApp();
const http = require("./../../../utils/http.js");
const qiniuUploader = require("./../../../utils/qiniuUploader");
const uploader = require("./../../../utils/uploadImage");

Page({
  data: {
    logs: [],
    imageArray: [],
    uploadToken: null,
    attachments: [],
    private: false,
    textContent: '',
    name: '',
    profile:null,
    title:'',
    salary:0
  },
  onLoad: function () {
  },  
  onShow: function () {
    //设置七牛上传token
    app.getUploadToken(token => {
      this.setData({
        uploadToken: token
      });
    });
    this.getProfile();
  },
  getProfile: function () {
    let _this = this;

    http.get('/profile', {}, res => {
      wx.hideLoading();
      console.log(res.data);
      if (res.data.error_code != 500) {
        let profile = res.data.data;
        _this.setData({profile:profile})
        if(profile == null){
          wx.showLoading({
            title: '请先完善资料！',
          });
          setTimeout(function () {
            wx.hideLoading();
            wx.navigateTo({
              url: '/pages/personal/set_profile/set_profile'
            })
          }, 2000);
        }
      }
    });
  },

  /** 提交 */
  submit: function (e) {
    wx.showLoading({
      title: '发布中...',
    });
    let content = this.data.textContent;
    let attachments = this.data.attachments;
    let title = this.data.title;
    let salary = this.data.salary;
    let formId = e.detail.formId;
    app.collectFormId(formId);

    http.post('/post_help', {
      content: content,
      attachments: attachments,
      title: title,
      salary: salary
    }, res => {
      console.log(res);
      wx.hideLoading();
      let data = res.data;
      if(data.error_code != 500){
        app.globalData.postHelp = true;
        wx.showLoading({
          title: '发布成功！',
        });
        setTimeout(function () {
          wx.hideLoading();
          wx.navigateBack({ comeBack: true });
        }, 1000);
      }else{
        wx.showLoading({
          title: data.error_message,
        });
        setTimeout(function () {
          wx.hideLoading();
        }, 1000);
      }
    });
  },
  /**
   * 选择图片并且上传到七牛
   */
  selectImage: function () {
    let _this = this;
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        let temArray = _this.data.imageArray;
        let temUrlArray = _this.data.attachments;
        var filePaths = res.tempFilePaths;
        let position = res.tempFilePaths.length - 1;
        wx.showLoading({
          title: '加载中',
        })

        filePaths.map((item, index) => {
          temArray.push(item);
          uploader.upload(item, key => {
            console.log(index);
            console.log(position);
            if (position == index) {
              wx.hideLoading();
            }
            let temAttachments = _this.data.attachments;
            if (key != '' || key != null) {
              temAttachments.push(key);
              _this.setData({
                attachments: temAttachments
              });
            }
            console.log(key);
          })
        });
        _this.setData({
          imageArray: temArray
        });
      }
    })
  },

  /**
   * 预览图片
   */
  previewImage: function (event) {
    let url = event.target.id;
    wx.previewImage({
      current: '',
      urls: [url]
    })
  },

  /**
   * 移除图片
   */
  removeImage: function (event) {
    let id = event.target.id;
    let arr = this.data.imageArray;
    let newAttachments = this.data.attachments;
    let newArray = arr.filter((item, index) => {
      if (index != id) {
        return item;
      }
    });
    newAttachments = newAttachments.filter((item, index) => {
      if (index != id) {
        return item;
      }
    });
    this.setData({
      imageArray: newArray,
      attachments: newAttachments
    });
  },

  /**
   * 获取输入内容
   */
  getTextContent: function (event) {
    let value = event.detail.value;
    this.setData({
      textContent: value
    });
  },
  /**
 * 获取输入内容
 */
  getTitle: function (event) {
    let value = event.detail.value;
    this.setData({
      title: value
    });
  },
  /**
  * 获取输入内容
  */
    getSalary: function (event) {
      let value = event.detail.value;
      this.setData({
        salary: value
      });
    }
})