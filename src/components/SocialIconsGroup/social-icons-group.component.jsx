import { SocialIcon } from 'react-social-icons';

import APPLICATION_VARIABLES from '../../settings';

const SocialIconsGroup = () => {

  return (
    <>
      {APPLICATION_VARIABLES.CHAPTER_INSTAGRAM_URL && (<SocialIcon network='instagram' url={`${APPLICATION_VARIABLES.CHAPTER_INSTAGRAM_URL}`} target='_blank' style={{ height: 35, width: 35, marginRight: 10  }} />)}
      {APPLICATION_VARIABLES.CHAPTER_TWITTER_URL && (<SocialIcon network='twitter' url={`${APPLICATION_VARIABLES.CHAPTER_TWITTER_URL}`} target='_blank' style={{ height: 35, width: 35, marginRight: 10 }} />)}
      {APPLICATION_VARIABLES.CHAPTER_FACEBOOK_URL && (<SocialIcon network='facebook' url={`${APPLICATION_VARIABLES.CHAPTER_FACEBOOK_URL}`} target='_blank' style={{ height: 35, width: 35, marginRight: 10 }} />)}
      {APPLICATION_VARIABLES.CHAPTER_YOUTUBE_URL && (<SocialIcon network='youtube' url={`${APPLICATION_VARIABLES.CHAPTER_YOUTUBE_URL}`} target='_blank' style={{ height: 35, width: 35, marginRight: 10 }} />)}
      {APPLICATION_VARIABLES.CHAPTER_CONTACT_EMAIL && (<SocialIcon network='email' url={`mailto:${APPLICATION_VARIABLES.CHAPTER_CONTACT_EMAIL}`} target='_blank' style={{ height: 35, width: 35}} />)}
    </>
  )
}

export default SocialIconsGroup;