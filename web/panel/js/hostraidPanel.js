/*
 * Copyright (C) 2016-2018 phantombot.tv
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * @author IllusionaryOne
 */

/*
 * hostraidPanel.js
 */

(function() {

   var refreshIcon = '<i class="fa fa-refresh" />',
       spinIcon = '<i style=\"color: var(--main-color)\" class="fa fa-spinner fa-spin" />',
       modeIcon = [],
       settingIcon = [];

       modeIcon['false'] = "<i style=\"color: var(--main-color)\" class=\"fa fa-circle-o\" />";
       modeIcon['true'] = "<i style=\"color: var(--main-color)\" class=\"fa fa-circle\" />";

       settingIcon['false'] = "<i class=\"fa fa-circle-o\" />";
       settingIcon['true'] = "<i class=\"fa fa-circle\" />";

    var hostHistory = false;

    /*
     * onMessage
     * This event is generated by the connection (WebSocket) object.
     */
    function onMessage(message) {
        var html = '',
            msgObject;

        try {
            msgObject = JSON.parse(message.data);
        } catch (ex) {
            return;
        }

        if (panelHasQuery(msgObject)) {

            if (panelCheckQuery(msgObject, 'hostraid_settings')) {
                for (var idx in msgObject['results']) {
                    if (panelMatch(msgObject['results'][idx]['key'], 'hostReward')) {
                        $('#hostRewardInput').val(msgObject['results'][idx]['value']).blur();
                    }
                    if (panelMatch(msgObject['results'][idx]['key'], 'autoHostReward')) {
                        $('#autoHostRewardInput').val(msgObject['results'][idx]['value']).blur();
                    }
                    if (panelMatch(msgObject['results'][idx]['key'], 'hostMinViewerCount')) {
                        $('#hostMinViewersInput').val(msgObject['results'][idx]['value']).blur();
                    }
                    if (panelMatch(msgObject['results'][idx]['key'], 'hostMinCount')) {
                        $('#hostMinViewersAlertInput').val(msgObject['results'][idx]['value']).blur();
                    }
                    if (panelMatch(msgObject['results'][idx]['key'], 'hostMessage')) {
                        $('#hostAnnounceInput').val(msgObject['results'][idx]['value']).blur();
                    }
                    if (panelMatch(msgObject['results'][idx]['key'], 'autoHostMessage')) {
                        $('#hostAutoAnnounceInput').val(msgObject['results'][idx]['value']).blur();
                    }
                    if (panelMatch(msgObject['results'][idx]['key'], 'hostToggle')) {
                        $('#hostToggle').html(modeIcon[msgObject['results'][idx]['value']]);
                    }
                    if (panelMatch(msgObject['results'][idx]['key'], 'autoHostToggle')) {
                        $('#autoHostToggle').html(modeIcon[msgObject['results'][idx]['value']]);
                    }
                    if (panelMatch(msgObject['results'][idx]['key'], 'hostHistory')) {
                        hostHistory = msgObject['results'][idx]['value'];
                        $('#hostHistoryMode').html(modeIcon[msgObject['results'][idx]['value']]);
                    }
                    if (panelMatch(msgObject['results'][idx]['key'], 'raidMessage')) {
                        $('#raidMessageInput').val(msgObject['results'][idx]['value']).blur();
                    }
                }
            }

            if (panelCheckQuery(msgObject, 'hostraid_hosthistory')) {
                if (msgObject['results'].length === 0) {
                    $('#hostHistoryList').html('<i>Keine Host-Geschichte-Daten anzuzeigen!</i>');
                    return;
                }

                html = '<table><tr><th>Kanal</th><th style="float: right">Datum/Zeit</th></tr>';

                for (idx = msgObject['results'].length - 1; idx >= 0; idx--) {
                    var hostData = JSON.parse(msgObject['results'][idx]['value']);
                    html +='<tr style="textList">' +
                           '  <td>' + hostData['host'] + '</td>' +
                           '  <td style="float: right">' + $.format.date(parseInt(hostData['time']), "MM.dd.yy HH:mm:ss") + '</td>' +
                           '</tr>';
                }
                html += '</table>';
                $('#hostHistoryList').html(html);
            }

            if (panelCheckQuery(msgObject, 'hostraid_inraids')) {
                if (msgObject['results'].length === 0) {
                    $('#incomingRaidList').html('<i>Keine eingehenden Überfall-Daten anzuzeigen.</i>');
                    return;
                }

                html = '<br><table><tr><th>Kanal</th><th style="float: right">Überfallzähler</th></tr>';

                for (idx in msgObject['results']) {
                    html += '<tr style="textList">' +
                            '    <td>' + msgObject['results'][idx]['key'] + '</td>' +
                            '    <td style="float: right">' + msgObject['results'][idx]['value'] + '</td>' +
                            '</tr>';
                }
                html += '</table>';
                $('#incomingRaidList').html(html);
            }

            if (panelCheckQuery(msgObject, 'hostraid_outraids')) {
                if (msgObject['results'].length === 0) {
                    $('#outgoingRaidList').html('<i>Keine ausgehenden Überfalldaten anzuzeigen.</i>');
                    return;
                }

                html = '<br><table><tr><th>Kanal</th><th style="float: right">Überfallzähler</th></tr>';

                for (idx in msgObject['results']) {
                    html += '<tr style="textList">' +
                            '    <td>' + msgObject['results'][idx]['key'] + '</td>' +
                            '    <td style="float: right">' + msgObject['results'][idx]['value'] + '</td>' +
                            '</tr>';
                }
                html += '</table>';
                $('#outgoingRaidList').html(html);
            }
        }
    }

    /**
     * @function doQuery
     */
    function doQuery() {
        sendDBKeys('hostraid_hosthistory', 'hosthistory');
        sendDBKeys('hostraid_settings', 'settings');
        sendDBKeys('hostraid_inraids', 'incommingRaids');
        sendDBKeys('hostraid_outraids', 'outgoingRaids');
    }

    /**
     * @function hostChannel
     */
    function hostChannel() {
        var value = $('#hostChannelInput').val();
        if (value.length > 0) {
            sendCommand('host ' + value);
            $('#hostChannelInput').val('');
        }
    }

    /**
     * @function raidChannel
     */
    function raidChannel() {
        var value = $('#raidChannelInput').val();
        if (value.length > 0) {
            sendCommand('raid ' + value);
            $('#raidChannelInput').val('');
        }
    }

    /**
     * @function raiderChannel
     */
    function raiderChannel() {
        var value = $('#raiderChannelInput').val();
        if (value.length > 0) {
            sendCommand('raider ' + value);
            $('#raiderChannelInput').val('');
        }
    }

    /**
     * @function updateHostAnnounce
     */
    function updateHostAnnounce() {
        var value = $('#hostAnnounceInput').val();
        if (value.length > 0) {
            console.log(value);
            sendDBUpdate('hostraid_settings', 'settings', 'hostMessage', value);
            sendCommand('reloadhost');
            setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
        }
    }

    /**
     * @function updateAutoHostAnnounce
     */
    function updateAutoHostAnnounce() {
        var value = $('#hostAutoAnnounceInput').val();
        if (value.length > 0) {
            sendDBUpdate('hostraid_settings', 'settings', 'autoHostMessage', value);
            sendCommand('reloadhost');
            setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
        }
    }

    /**
     * @function updateHostReward
     */
    function updateHostReward() {
        var value = $('#hostRewardInput').val();
        if (value.length > 0) {
            sendDBUpdate('hostraid_settings', 'settings', 'hostReward', value);
            sendCommand('reloadhost');
            setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
        }
    }

    /**
     * @function updateAutoHostReward
     */
    function updateAutoHostReward() {
        var value = $('#autoHostRewardInput').val();
        if (value.length > 0) {
            sendDBUpdate('hostraid_settings', 'settings', 'autoHostReward', value);
            sendCommand('reloadhost');
            setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
        }
    }

    /**
     * @function updateHostMinViewers
     */
    function updateHostMinViewers() {
        var value = $('#hostMinViewersInput').val();
        if (value.length > 0) {
            sendDBUpdate('hostraid_settings', 'settings', 'hostMinViewerCount', value);
            sendCommand('reloadhost');
            setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
        }
    }

    /**
     * @function updateHostMinViewers
     */
    function hostMinViewersAlert() {
        var value = $('#hostMinViewersAlertInput').val();
        if (value.length > 0) {
            sendDBUpdate('hostraid_settings', 'settings', 'hostMinCount', value);
            sendCommand('reloadhost');
            setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
        }
    }

    /**
     * @function changeHostHistory
     * @param {String} action
     */
    function changeHostHistory(action) {
        if (hostHistory == "true") {
            sendDBUpdate('hostraid_settings', 'settings', 'hostHistory', 'false');
        } else {
            sendDBUpdate('hostraid_settings', 'settings', 'hostHistory', 'true');
        }
        sendCommand('reloadhost');
        setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
    }

    /**
     * @function updateRaidMessage
     */
    function updateRaidMessage() {
        var value = $('#raidMessageInput').val();
        if (value.length > 0) {
            sendDBUpdate('hostraid_settings', 'settings', 'raidMessage', value);
            setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
        }
    }

    /**
     * @function toggle
     */
    function toggle(table, key, value) {
        $('#' + key).html(spinIcon);
        sendDBUpdate('hostraid_settings', table, key, value);
        setTimeout(function() { doQuery(); sendCommand('reloadhost'); }, TIMEOUT_WAIT_TIME);
    }

    // Import the HTML file for this panel.
    $('#hostraidPanel').load('/panel/hostraid.html');

    // Load the DB items for this panel, wait to ensure that we are connected.
    var interval = setInterval(function() {
        if (isConnected && TABS_INITIALIZED) {
            var active = $('#tabs').tabs('option', 'active');
            if (active == 13) {
                doQuery();
                clearInterval(interval);
            }
        }
    }, INITIAL_WAIT_TIME);

    // Query the DB every 30 seconds for updates.
    setInterval(function() {
        var active = $('#tabs').tabs('option', 'active');
        if (active == 13 && isConnected && !isInputFocus()) {
            newPanelAlert('Aktualisiere Hosts/Überfallsdaten...', 'success', 1000);
            doQuery();
        }
    }, 3e4);

    // Export to HTML
    $.hostraidOnMessage = onMessage;
    $.hostraidDoQuery = doQuery;
    $.hostChannel = hostChannel;
    $.raidChannel = raidChannel;
    $.raiderChannel = raiderChannel;
    $.updateHostAnnounce = updateHostAnnounce;
    $.updateAutoHostAnnounce = updateAutoHostAnnounce;
    $.updateHostReward = updateHostReward;
    $.updateAutoHostReward = updateAutoHostReward;
    $.updateHostMinViewers = updateHostMinViewers;
    $.changeHostHistory = changeHostHistory;
    $.updateRaidMessage = updateRaidMessage;
    $.toggle = toggle;
    $.hostMinViewersAlert = hostMinViewersAlert;
})();
