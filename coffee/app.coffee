# utils

is_touch_device = null

detect_touch_devices = ->
  document.querySelector("img").setAttribute('ongesturestart', 'return;')
  is_touch_device =
    !!document.querySelector("img").ongesturestart

detect_touch_devices()

H = Hammer

$("img").css "transtionDuration", "1s"

$("body").imagesLoaded ->

  class Gallery
    images: $ "img"

    positions:
      left:  -> -$(window).width()
      right: -> $(window).width()

    index: 0

    current: ->
      $ this.images[this.index]
    image_right: ->
      $ this.images[this.index+1]
    image_left: ->
      $ this.images[this.index-1]

    resize: ->
      resize_image this.images
      #$(window).on "resize", =>
      #  resize_image this.images

    init: ->
      # this.resize()
      this.reposition_images()
      this.bind_gestures()
      this.show_images()

      $("img").on "webkitTransitionEnd", =>
        this.show_images()

    next: ->
      this.current().translateX this.positions.left()
      this.image_right().translateX 0
      this.image_left().translateX this.positions.right()
      this.index += 1
      this.bind_gestures()

    prev: ->
      this.image_right().translateX this.positions.left()
      this.current().translateX this.positions.right()
      this.index -= 1
      this.bind_gestures()

    reposition_images: ->
      this.images.translateX this.positions.right()
      this.current().translateX 0

    bind_gestures: ->

      start_x = 0
      direction = "right"

      handle_drag = (evt) ->
        x = if evt.gesture
          evt.gesture.deltaX
        else
          evt.changedTouches[0].pageX - start_x

        gallery.current().translateX x


      move = (evt) =>
        img.className = "fast"
        handle_drag evt
        evt.preventDefault()

      drag_start = (evt) =>
        start_x = evt.gesture.center.pageX

      move_end = (evt) =>
        img.className = null
        log this.current().get(0).dataset.id
        page_x = this.get_touch(evt).pageX
        x = start_x - page_x

        console.log this.current().data("id")

        if x > 0 && this.current().data("id") >= this.images.length-1
          this.current().translateX 0
        else if x > 0
          direction = "right"
          this.next()
          removeListeners()
        else if this.current().data("id") > 0 # drag_right
          direction = "left"
          this.prev()
          removeListeners()
        else
          this.current().translateX 0


      removeListeners = ->

        img.removeEventListener "touchend", move_end
        h_img = H(img)
        h_img.off "drag", move
        h_img.off "dragstart", drag_start
        h_img.off "dragend", move_end

        img.removeEventListener "touchstart", drag_start
        img.removeEventListener "touchmove", move
        img.removeEventListener "touchend", move_end


      # _(this.images).map (img) ->
        # $(img).off(["drag", "dragstart", "dragend", "swipeleft", "swiperight"])
        # console.log $(img).get(0)


      img = this.current().get 0


      img.addEventListener "touchstart", (evt) =>
        start_x = this.get_touch(evt).pageX

      img.addEventListener "touchmove", move

      img.addEventListener "touchend", move_end

      img.addEventListener "webkitTransitionEnd", =>
        console.log direction
        this.show_images direction

      return if is_touch_device # blocks execution

      h_image = H(this.current().get 0, swipe_velocity: 0.4, drag_block_vertical: true)

      handle_drag_thrott = _.throttle(handle_drag, 110)

      h_image.on "drag", move
      h_image.on "dragstart", drag_start
      h_image.on "dragend", move_end


      # h_image.on "swipeleft", =>
      #   this.next()
      #   console.log "swipe left"

      # h_image.on "swiperight", =>
      #   this.prev()
      #   console.log "swipe right"

    show_images: (direction) ->
      this.images.css         opacity: 0
      this.current().css      opacity: 1
      if direction == "left"
        this.image_right().css  opacity: 0
        this.image_left().css   opacity: 1
      else
        this.image_right().css  opacity: 1
        this.image_left().css   opacity: 0


    # private

    get_touch: (evt) ->
      return evt.gesture.center if evt.gesture
      return evt.changedTouches[0]     if evt.changedTouches
      throw "unable to get_touch"

  # main

  gallery = new Gallery()
  window.gallery = gallery
  gallery.init()


$.fn.transform = (values) ->
  this.css "transform",         values
  this.css "-ms-transform",     values
  this.css "-webkit-transform", values

$.fn.translate = (left, top) ->
  # image.css left: left, top: top # fallback
  this.transform "translate3d(#{left}px, #{top}px, 0)"

$.fn.translateX = (left) ->
  # image.css left: left, top: top # fallback
  this.transform "translateX(#{left}px)"

resize_image = (image) ->
  base = get_base_image image
  prop = base.width / base.height

  if prop > 0 # horizontal
    width = Math.min base.width, $(window).width()
    image.width width
  else # vertical
    height = Math.min base.height, $(window).height()
    width = height * prop
    image.width width

  top   = $(window).height()/2 - image.height()/2
  left  = $(window).width()/2 - image.width()/2
  image.translate left, top

resize_images = (images) ->
  base = get_base_image $(images[0])
  prop = base.width / base.height

  if prop > 0 # horizontal
    width = Math.min base.width, $(window).width()
    images.width width
  else # vertical
    height = Math.min base.height, $(window).height()
    width = height * prop
    images.width width

  top   = $(window).height()/2 - images.height()/2
  left  = $(window).width()/2 - images.width()/2
  images.translate left, top

get_base_image = (current) ->
  image = new Image()
  image.src = current.attr "src"
  image

debug = (string) ->
  $(".debug").html string


log = (string) ->
  existing = $(".debug").html()
  existing = "#{existing}<br>" if existing
  $(".debug").html "#{existing}#{string}"
