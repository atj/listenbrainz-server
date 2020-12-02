/* eslint-disable camelcase */
import * as timeago from "time-ago";

import * as React from "react";
import { get as _get } from "lodash";
import {
  faEllipsisV,
  faGripLines,
  faTrashAlt,
  faHeart,
  faHeartBroken,
} from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { getArtistLink, getTrackLink } from "../utils";
import { getTrackExtension } from "./utils";
import Card from "../components/Card";
import APIService from "../APIService";
import ListenControl from "../listens/ListenControl";

export const DEFAULT_COVER_ART_URL = "/static/img/default_cover_art.png";

export type PlaylistItemCardProps = {
  apiUrl: string;
  track: JSPFTrack;
  currentFeedback: ListenFeedBack;
  canEdit: Boolean;
  className?: string;
  currentUser?: ListenBrainzUser;
  playTrack: (track: JSPFTrack) => void;
  removeTrackFromPlaylist: (track: JSPFTrack) => void;
  updateFeedback: (recordingMsid: string, score: ListenFeedBack) => void;
  newAlert: (
    alertType: AlertType,
    title: string,
    message: string | JSX.Element
  ) => void;
};

type PlaylistItemCardState = {
  isDeleted: Boolean;
};

export default class PlaylistItemCard extends React.Component<
  PlaylistItemCardProps,
  PlaylistItemCardState
> {
  APIService: APIService;
  playTrack: (track: JSPFTrack) => void;

  constructor(props: PlaylistItemCardProps) {
    super(props);

    this.state = {
      isDeleted: false,
    };

    this.APIService = new APIService(
      props.apiUrl || `${window.location.origin}/1`
    );

    this.playTrack = props.playTrack.bind(this, props.track);
  }

  removeTrack = () => {
    const { track, removeTrackFromPlaylist } = this.props;
    removeTrackFromPlaylist(track);
  };

  handleError = (error: string | Error, title?: string): void => {
    const { newAlert } = this.props;
    if (!error) {
      return;
    }
    newAlert(
      "danger",
      title || "Error",
      typeof error === "object" ? error.message : error
    );
  };

  render() {
    const {
      track,
      canEdit,
      className,
      currentFeedback,
      updateFeedback,
    } = this.props;
    const { isDeleted } = this.state;
    const customFields = getTrackExtension(track);
    const trackDuration = track.duration
      ? (track.duration / 100000).toFixed(2)
      : "?";
    const recordingMbid = track.id as string;
    return (
      <Card
        onDoubleClick={this.playTrack}
        className={`playlist-item-card row ${className} ${
          isDeleted ? " deleted" : ""
        }`}
        data-recording-mbid={track.id}
      >
        {/* We can't currently disable the SortableJS component (https://github.com/SortableJS/react-sortablejs/issues/153)
        So insteand we hide the drag handle */}
        {canEdit && (
          <FontAwesomeIcon
            icon={faGripLines as IconProp}
            title="Drag to reorder"
            className="drag-handle text-muted"
          />
        )}
        <div className="track-details">
          <div title={track.title}>
            {/* {getTrackLink(track)} */}
            {track.title}
          </div>
          <small className="text-muted" title={track.creator}>
            {/* {getArtistLink(track)} */}
            {track.creator}
          </small>
        </div>
        <div className="track-duration">{trackDuration}</div>
        <div className="listen-controls">
          <ListenControl
            icon={faHeart}
            title="Love"
            action={() =>
              updateFeedback(recordingMbid, currentFeedback === 1 ? 0 : 1)
            }
            className={`${currentFeedback === 1 ? " loved" : ""}`}
          />
          <ListenControl
            icon={faHeartBroken}
            title="Hate"
            action={() =>
              updateFeedback(recordingMbid, currentFeedback === -1 ? 0 : -1)
            }
            className={`${currentFeedback === -1 ? " hated" : ""}`}
          />
        </div>
        <div className="addition-details">
          <div>added by {customFields?.added_by}</div>
          {customFields?.added_at && (
            <span
              className="listen-time"
              title={String(Number(customFields.added_at) * 1000)}
            >
              {timeago.ago(Number(customFields.added_at) * 1000)}
            </span>
          )}
        </div>

        <span className="dropdown">
          <button
            className="btn btn-link dropdown-toggle"
            type="button"
            id="listenControlsDropdown"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="true"
          >
            <FontAwesomeIcon
              icon={faEllipsisV as IconProp}
              title="More options"
            />
          </button>
          <ul
            className="dropdown-menu dropdown-menu-right"
            aria-labelledby="listenControlsDropdown"
          >
            <li>
              <a
                href={`//musicbrainz.org/recording/${recordingMbid}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in MusicBrainz
              </a>
            </li>
            {canEdit && (
              <li>
                <button onClick={this.removeTrack} type="button">
                  <FontAwesomeIcon icon={faTrashAlt as IconProp} /> Remove from
                  playlist
                </button>
              </li>
            )}
          </ul>
        </span>
      </Card>
    );
  }
}
