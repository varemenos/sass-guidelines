(function (global) {
  'use strict';

  function getDocumentHeight () {
    return global.innerHeight || document.clientHeight || document.body.clientHeight;
  }

  function getDocumentScrollTop () {
    return document.documentElement.scrollTop || document.body.scrollTop;
  }

  function evalClientResolution () {
    return global.matchMedia('(min-width: 975px)').matches;
  }

  function getOffset (elem) {
    var offset = 0;

    do {
      if (!isNaN(elem.offsetTop)) offset += elem.offsetTop;
    } while(elem = elem.offsetParent);

    return offset;
  }

  var Sidebar = function (config) {
    this.addOffsetView = config.addOffsetView || 0;
    this.headings = config.headings;
    this.tableOfContents = config.tableOfContents;
    this.footer = config.footer;
    this.isLargerThanMobile = evalClientResolution();

    this.headingsOffset = Array.prototype.slice.call(this.headings)
      .map(function (heading) {
        return [ heading, getOffset(heading) ];
      });

    this.initialize();
  };
  /**
   * Initializes application by calling all necessary functions.
   */
  Sidebar.prototype.initialize = function () {
    this.isLargerThanMobile && this.evalHeadingsPosition();
    this.adjustTableOfContents();

    document.addEventListener('scroll', this.adjustTableOfContents.bind(this), false);
    global.addEventListener('scroll', this.evalHeadingsPosition.bind(this), false);
    global.addEventListener('resize', evalClientResolution, false);
  };

  Sidebar.prototype.evalHeadingsPosition = function () {
    var scrollTop = getDocumentScrollTop() + this.addOffsetView;

    if (this.isLargerThanMobile) {
      // Loop over all headings offsets & compare scrollTop if already passed a value.
      for (var i = 0, offsets = this.headingsOffset.length; i < offsets; i++) {
        if (
          scrollTop >= this.headingsOffset[i][1] &&
          this.headingsOffset[i+1] &&
          scrollTop < this.headingsOffset[i + 1][1]
        ) {
          this.highlightTableOfContents(this.headingsOffset[i]);
        }

        // Last element reached.
        else if (
          this.headingsOffset[i] === this.headingsOffset[offsets-1] &&
          scrollTop >= this.headingsOffset[i][1]
        ) {
          this.highlightTableOfContents(this.headingsOffset[offsets-1]);
        }
      }
    }
  };

  Sidebar.prototype.adjustTableOfContents = function () {
    var top = getOffset(this.tableOfContents);
    var bottom = getOffset(this.footer);
    var current = getDocumentScrollTop();
    var currentBottom = current + getDocumentHeight();

    if (current > top) {
      this.tableOfContents.classList.add('sticky');
    } else {
      this.tableOfContents.classList.remove('sticky');
    }

    if (currentBottom > bottom) {
      this.tableOfContents.classList.add('sticky-bottom');
    } else {
      this.tableOfContents.classList.remove('sticky-bottom');
    }
  };

  Sidebar.prototype.highlightTableOfContents = function (heading) {
    var tocElem = this.tableOfContents.querySelector('a[href="#' + heading[0].id + '"]');
    var inViewportElem = this.tableOfContents.querySelector('.in-viewport');

    if (!!tocElem && !tocElem.classList.contains('in-viewport')) {
      if (inViewportElem) {
        inViewportElem.classList.remove('in-viewport');
      }

      tocElem.classList.add('in-viewport');
    }
  };

  global.Sidebar = Sidebar;
}(window));