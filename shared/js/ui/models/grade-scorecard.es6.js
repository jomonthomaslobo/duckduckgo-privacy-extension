const Parent = window.DDG.base.Model

function GradeScorecard (attrs) {
  Parent.call(this, attrs)

  if (!this.site) {
    throw new Error('The GradeScorecard model needs a Site model to be passed in')
  }
}

GradeScorecard.prototype = window.$.extend({},
  Parent.prototype,
  {
    modelName: 'gradeScorecard',

    getReasons: function () {
      let reasons = []

      // grab all the data from the site to create
      // a list of reasons behind the grade

      // encryption status
      const httpsStatusText = this.site.httpsStatusText
      if (httpsStatusText) {
        let connectionMsg = 'Unencrypted'
        let modifier = 'bad'

        if (httpsStatusText === 'Secure') {
          connectionMsg = 'Encrypted'
          modifier = 'good'
        }

        reasons.push({
          modifier,
          msg: `${connectionMsg} Connection`
        })
      }

      // tracking networks blocked,
      // only show a message if there's any blocked
      const numTrackerNetworks = this.site.trackerNetworks.length
      if (numTrackerNetworks) {
        reasons.push({
          modifier: 'bad',
          msg: `${numTrackerNetworks} Tracker Networks Blocked`
        })
      }

      // major tracking networks,
      // only show a message if it's bad
      const isPartOfMajorTrackingNetwork = this.site.isaMajorTrackingNetwork ||
        this.site.trackerNetworks.some((tracker) =>
          window.constants.majorTrackingNetworks[tracker]
        )

      if (isPartOfMajorTrackingNetwork) {
        reasons.push({
          modifier: 'bad',
          msg: `Site Is Part of a Major Tracker Network`
        })
      }

      // privacy practices from tosdr
      const privacyMessage = this.site.tosdr && this.site.tosdr.message
      if (privacyMessage && privacyMessage !== window.constants.tosdrMessages.unknown) {
        reasons.push({
          modifier: privacyMessage.toLowerCase(),
          msg: `${privacyMessage} Privacy Practices`
        })
      }

      return reasons
    },

    getGrades: function () {
      const rating = this.site.siteRating
      if (!rating || !rating.before || !rating.after) return

      // transform site ratings into grades
      // that the template can display more easily
      const before = rating.before
      const after = rating.after

      let grades = []

      grades.push({
        msg: 'Privacy Grade',
        modifier: before.toLowerCase()
      })

      if (before !== after && !this.site.isWhitelisted) {
        grades.push({
          msg: 'Enhanced Grade',
          modifier: after.toLowerCase(),
          highlight: true
        })
      }

      return grades
    }
  }
)

module.exports = GradeScorecard
