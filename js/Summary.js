"use strict";

var Summary = {
  makeSummaryForData: function summary_makeSummaryForData(data) {
    var html = '<tr><td>' + UI.linkifyBug(data.id) + '</td><td>';
    if ('status' in data && data.status == 'RESOLVED')
      html += 'Y';
    else
      html += 'N';
    html += '</td><td>';
    if ('status' in data && data.status == 'REOPENED')
      html += 'Y';
    else
      html += 'N';
    html += '</td><td>';
    if ('target_milestone' in data)
      html += data.target_milestone;
    else
      html += '&nbsp;';
    html += '</td><td>';
    if ('assigned_to' in data)
      html += UI.htmlEncode(data.assigned_to.name);
    else
     html += '&nbsp;';
    html += '</td><td>';
    if ('comments' in data) {
      var comment = data.comments[0].text;
      comment = comment.replace(/\n/g, '<br>');
      Config.hgRevFullRE.lastIndex = 0;
      comment = comment.replace(Config.hgRevFullRE, function(str) {return UI.linkifyRevURL(str);});
      html += comment;
    } else
      html += '&nbsp;';
    html += '</tr>';
    return html;
  },


  makeSummaryForStep: function summary_makeSummaryForStep(step) {
    var html = '<h3>' + step.getHeading(false) + '</h3>';
    var sent = step.getSentData();
    if (sent.length == 0) {
      html += '<p><em>No changes submitted.</em></p>';
      return html;
    }

    html += '<br><table class="summaryTable"><tr class="thead"><td>Bug</td><td>Resolved?</td>';
    html += '<td>Reopened?</td><td>Target Milestone</td><td>Assignee</td><td>Comment</td></tr>';
    html += sent.map(function(data) {return this.makeSummaryForData(data);}, this).join('');
    html += '</table>';
    return html;
  },


  makeUnsubmittedHTML: function summary_makeUnsubmittedHTML(steps) {
    var subhtml = '';
    for (var i = 0; i < steps.length; i++) {
       if (steps[i].canSubmit())
         subhtml += '<li>'+steps[i].getHeading(false)+'</li>';
    }

    if (subhtml == '')
      return subhtml;

    var html = '<p class="clear"><span class="subwarn">WARNING: </span>The following steps seem to have changes that could be sent to Bugzilla,';
    html += ' but have not been submitted. You may wish to double-check them:</p><ul>' + subhtml + '</ul>';
    return html;
  },


  makeSecBugHTML: function summary_makeSecBugHTML(steps) {
    var sechtml = '';
    for (var i = 0; i < steps.length; i++) {
       if (steps[i].hasSecurityBugs()) {
         sechtml += '<li>'+steps[i].getHeading(false) + '<br>';
         var sb = steps[i].getSecurityBugs();
         sechtml += '<table><tr><td>Changeset</td><td>Link</td><td>Bug</td></tr>';
         for (var j = 0; j < sb.length; j++) {
           sechtml += '<tr><td>' + sb[j].cset + '</td><td>' + UI.linkifyRevURL(sb[j].link);
           sechtml += '</td><td>' + UI.linkifyBug(sb[j].bug) + '</td></tr>';
         }
         sechtml += '</table>';
      }
    }

    if (sechtml == '')
      return sechtml;

    var html = '<p class="clear">The following steps had security bugs, which you will need to check';
    html += ' and resolve/comment manually:</p><ul>' + sechtml + '</ul>';
    return html;
  },


  makeButtonHTML: function summary_makeButtonHTML(prevLabel, nextLabel) {
    var html = '<nav class="prevNextButtons">';
    html += '<div class="left">';
    html += '  <button type="button" class="summaryPrevButton">' + prevLabel + '</button>';
    html += '</div>';
    html += '<div class="right">';
    html += '  <button type="button" class="summaryNextButton">' + nextLabel + '</button>';
    html += '</div>'
    html += '</nav>'
    return html;
  },


  view: function summary_View(steps, onPrevious, onNext) {
    // Hide any previous viewer output
    UI.hide('viewerOutput');
    UI.clearErrorMessage();
    $('#viewerOutput').empty();
    $('#viewerOutput').append(this.makeButtonHTML(onPrevious.label, onNext.label));

    var subHTML = this.makeUnsubmittedHTML(steps);
    if (subHTML != '')
      $('#viewerOutput').append(subHTML + '<hr>');

    var secHTML = this.makeSecBugHTML(steps);
    if (secHTML != '')
      $('#viewerOutput').append(secHTML + '<hr>');

    $('#viewerOutput').append('<div class="ctr"><h2 class="summaryHeading">Summary of activity</h2></div>');

    steps.forEach(function step_viewSummaryMaker(step){
      $('#viewerOutput').append(this.makeSummaryForStep(step));
    }, this);

    $('#viewerOutput').append(this.makeButtonHTML(onPrevious.label, onNext.label));
    if (onPrevious.fn) {
      $('.summaryPrevButton').click(function Step_onPreviousClick(e) {
        onPrevious.fn();
      });
    } else {
      $('.summaryPrevButton').attr('disabled', true);
    }

    if (onNext.fn) {
      $('.summaryNextButton').click(function Step_onNextClick(e) {
        onNext.fn();
      });
    } else {
      $('.summaryNextButton').attr('disabled', true);
    }

    UI.show('viewerOutput');
    $('html')[0].scrollIntoView();
  }
}

