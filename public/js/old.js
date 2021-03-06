var H, add_devices_css, debug, detect_touch_devices, get_base_image, is_ffos, is_touch_device, log,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

is_touch_device = null;

is_ffos = navigator.userAgent.match(/Mozilla\/\d+\.\d+ \(Mobile/);

detect_touch_devices = function() {
  document.querySelector("img").setAttribute('ongesturestart', 'return;');
  return is_touch_device = !!document.querySelector("img").ongesturestart;
};

add_devices_css = function() {
  if (is_ffos) {
    return document.body.classList.add("ffos");
  }
};

detect_touch_devices();

H = Hammer;

$("body").imagesLoaded(function() {
  var Gallery, Thumbs, gallery, thumbs;
  add_devices_css();
  $('img').on('dragstart', function(evt) {
    return evt.preventDefault();
  });
  Thumbs = (function() {
    function Thumbs() {}

    Thumbs.prototype.container = $(".thumbs");

    Thumbs.prototype.images = $(".thumbs img");

    Thumbs.prototype.imagez = function() {
      return $(".thumbs img");
    };

    Thumbs.prototype.imgs = _(Thumbs.images);

    Thumbs.prototype.init = function() {
      var img_width, width;
      img_width = 80;
      _(this.imagez()).each(function(img, idx) {
        var _this = this;
        return img.addEventListener("click", function() {
          return gallery.go_to(parseInt(img.dataset.id));
        });
      });
      width = (img_width + 8) * this.imagez().length;
      return this.container.width(width);
    };

    return Thumbs;

  })();
  Gallery = (function() {
    function Gallery() {
      this.move_end = __bind(this.move_end, this);
      this.move_start = __bind(this.move_start, this);
      this.move = __bind(this.move, this);
      this.images_show = __bind(this.images_show, this);
      this.win_resize_images = __bind(this.win_resize_images, this);
    }

    Gallery.prototype.images = $(".main img");

    Gallery.prototype.anim_time = 300;

    Gallery.prototype.positions = {
      left: function() {
        return -$(window).width();
      },
      right: function() {
        return $(window).width();
      }
    };

    Gallery.prototype.index = 0;

    Gallery.prototype.go_to = function(id) {
      if (id === this.index) {
        return;
      }
      $(".main img").remove();
      this.load_image(id - 1);
      this.load_image(id);
      this.load_image(id + 1);
      this.prepare_for_animation();
      this.index = id;
      this.images.translateX(this.positions.right());
      this.current().translateX(0);
      this.images.css({
        opacity: 0
      });
      this.cur_img().style.opacity = 1;
      return this.bind_gestures();
    };

    Gallery.prototype.current = function() {
      return $(this.images[this.index]);
    };

    Gallery.prototype.cur_img = function() {
      return this.current().get(0);
    };

    Gallery.prototype.image_right = function() {
      return $(this.images[this.index + 1]);
    };

    Gallery.prototype.image_left = function() {
      return $(this.images[this.index - 1]);
    };

    Gallery.prototype.image_left_left = function() {
      return $(this.images[this.index - 2]);
    };

    Gallery.prototype.slides = [];

    Gallery.prototype.init = function() {
      var _this = this;
      return $.getJSON("/slides.json", function(slides) {
        _this.slides = slides;
        return _this.initialize();
      });
    };

    Gallery.prototype.initialize = function() {
      this.prepare_for_animation();
      this.reposition_images();
      this.bind_gestures();
      this.show_images("right");
      this.images_hide();
      window.onresize = this.win_resize_images;
      setTimeout(this.images_show, 400);
      return window.addEventListener("keydown", this.handle_keyboard.bind(this));
    };

    Gallery.prototype.load_image = function(idx) {
      var gallery, img, url;
      url = "/issues/4/" + this.slides[idx] + ".jpg";
      img = new Image();
      img.src = url;
      img.dataset.id = idx;
      $(img).translateX(this.positions.right());
      gallery = document.querySelector(".main");
      gallery.appendChild(img);
      return this.images.push(img);
    };

    Gallery.prototype.win_resize_images = function() {
      this.images.each(function(idx, img) {
        return $(img).width = $(window).width();
      });
      this.images.translateX(this.positions.right());
      return this.current().translateX(0);
    };

    Gallery.prototype.images_hide = function() {
      return _(this.images).each(function(img, idx) {
        return img.style.opacity = 0;
      });
    };

    Gallery.prototype.images_show = function() {
      return _(this.images).each(function(img, idx) {
        return img.style.opacity = 1;
      });
    };

    Gallery.prototype.zindex_sort = function() {
      return _(this.images).each(function(img, idx) {
        return img.style.zIndex = idx + 1;
      });
    };

    Gallery.prototype.zindex_sort_reverse = function() {
      var _this = this;
      return _(this.images).each(function(img, idx) {
        return img.style.zIndex = _this.images.length - idx;
      });
    };

    Gallery.prototype.images_next = function() {
      return this.images.slice(this.index + 1);
    };

    Gallery.prototype.images_prev = function() {
      return this.images.slice(0, +(this.index - 1) + 1 || 9e9);
    };

    Gallery.prototype.animate_forward = function() {
      this.zindex_sort();
      this.current().translateX(this.positions.left());
      return this.image_right().translateX(0);
    };

    Gallery.prototype.animate_backward = function() {
      this.zindex_sort_reverse();
      this.image_left().translateX(0);
      return this.current().translateX(this.positions.right());
    };

    Gallery.prototype.next = function() {
      var _this = this;
      if (this.index >= this.slides.length - 1) {
        return;
      }
      setTimeout(function() {
        return _this.show_images("right");
      }, this.anim_time);
      if (this.index <= this.slides.length - 3) {
        this.load_image(this.index + 2);
      }
      this.images_next().translateX(this.positions.right());
      return this.prepare_for_animation(function() {
        _this.animate_forward();
        _this.index += 1;
        return _this.bind_gestures();
      });
    };

    Gallery.prototype.prev = function() {
      var _this = this;
      if (this.index <= 0) {
        return;
      }
      setTimeout(function() {
        return _this.show_images("left");
      }, this.anim_time);
      this.images_prev().translateX(this.positions.left());
      return this.prepare_for_animation(function() {
        _this.animate_backward();
        _this.index -= 1;
        return _this.bind_gestures();
      });
    };

    Gallery.prototype.reposition_images = function() {
      this.images.translateX(this.positions.right());
      return this.current().translateX(0);
    };

    Gallery.prototype.prepare_for_animation = function(callback) {
      var img, _i, _len, _ref,
        _this = this;
      _ref = this.images;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        img = _ref[_i];
        img.className = "fast";
      }
      return setTimeout(function() {
        var _j, _len1, _ref1;
        _ref1 = _this.images;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          img = _ref1[_j];
          img.className = null;
        }
        if (callback) {
          return callback();
        }
      }, 100);
    };

    Gallery.prototype.start_x = null;

    Gallery.prototype.move = function(evt) {
      this.cur_img().className = "fast";
      this.handle_drag(evt);
      return evt.preventDefault();
    };

    Gallery.prototype.handle_drag = function(evt) {
      var x;
      x = evt.gesture ? evt.gesture ? evt.gesture.deltaX : void 0 : evt.changedTouches ? evt.changedTouches[0].pageX - this.start_x : evt.pageX;
      return this.current().translateX(x);
    };

    Gallery.prototype.move_start = function(evt) {
      return this.start_x = this.get_touch(evt).pageX;
    };

    Gallery.prototype.move_end = function(evt) {
      var id, moving_left_at_start, moving_right_at_end, not_enough_movement, page_x, x, x_delta, x_delta_min;
      this.cur_img().className = null;
      page_x = this.get_touch(evt).pageX;
      x = this.start_x - page_x;
      x_delta = Math.abs(x);
      x_delta_min = 30;
      id = this.current().data("id");
      not_enough_movement = x_delta < x_delta_min;
      moving_left_at_start = id <= 0 && x < 0;
      moving_right_at_end = id >= this.slides.length - 1 && x > 0;
      if (not_enough_movement || moving_left_at_start || moving_right_at_end) {
        this.current().translateX(0);
      } else if (x > 0) {
        return this.next();
      } else if (id > 0) {
        return this.prev();
      } else {
        console.log(id, x_delta);
        throw "move_end should not reach here";
      }
    };

    Gallery.prototype.unbind_gestures = function() {
      return _(this.images).each(function(img) {
        var h_img;
        h_img = H(img);
        h_img.off("drag", this.move);
        h_img.off("dragstart", this.move_start);
        h_img.off("dragend", this.move_end);
        img.removeEventListener("touchstart", this.move_start);
        img.removeEventListener("touchmove", this.move);
        return img.removeEventListener("touchend", this.move_end);
      });
    };

    Gallery.prototype.bind_gestures = function() {
      var h_image;
      this.unbind_gestures();
      this.cur_img().addEventListener("touchstart", this.move_start);
      this.cur_img().addEventListener("touchmove", this.move);
      this.cur_img().addEventListener("touchend", this.move_end);
      if (is_ffos) {
        return;
      }
      h_image = H(this.cur_img(), {
        swipe_velocity: 0.4,
        drag_block_vertical: true
      });
      h_image.on("drag", this.move);
      h_image.on("dragstart", this.move_start);
      return h_image.on("dragend", this.move_end);
    };

    Gallery.prototype.handle_keyboard = function(evt) {
      if (evt.keyCode === 37) {
        this.prev();
      }
      if (evt.keyCode === 39) {
        return this.next();
      }
    };

    Gallery.prototype.show_images = function(direction) {
      $(this.images).css({
        opacity: 0
      });
      this.current().css({
        opacity: 1
      });
      if (direction === "left") {
        this.image_left().css({
          opacity: 1
        });
        this.image_left_left().css({
          opacity: 1
        });
        return this.image_right().css({
          opacity: 1
        });
      } else {
        this.image_right().css({
          opacity: 1
        });
        return this.image_left().css({
          opacity: 1
        });
      }
    };

    Gallery.prototype.get_touch = function(evt) {
      if (evt.gesture) {
        return evt.gesture.center;
      }
      if (evt.changedTouches) {
        return evt.changedTouches[0];
      }
      if (evt.pageX) {
        return evt;
      }
      throw "unable to get_touch";
    };

    return Gallery;

  })();
  gallery = new Gallery();
  window.gallery = gallery;
  gallery.init();
  thumbs = new Thumbs();
  window.thumbs = thumbs;
  return thumbs.init();
});

$.fn.transform = function(values) {
  this.css("transform", values);
  this.css("-ms-transform", values);
  return this.css("-webkit-transform", values);
};

$.fn.translate = function(left, top) {
  return this.transform("translate3d(" + left + "px, " + top + "px, 0)");
};

$.fn.translateX = function(left) {
  return this.transform("translateX(" + left + "px)");
};

get_base_image = function(current) {
  var image;
  image = new Image();
  image.src = current.attr("src");
  return image;
};

debug = function(string) {
  return $(".debug").html(string);
};

log = function(string) {
  var existing;
  existing = $(".debug").html();
  if (existing) {
    existing = "" + existing + "<br>";
  }
  return $(".debug").html("" + existing + string);
};
