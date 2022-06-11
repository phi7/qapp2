type Props = {
  url: string;
  text: string;
};

export default function TwitterShareButton(props: Props) {
  const url = `https://twitter.com/share?url=${encodeURIComponent(
    props.url
  )}&text=${encodeURIComponent(props.text)}&hashtags=MyQuestionService`;

  return (
    <a
      href={url}
      className="twitter-share-button"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src="/images/Twitter_Logo_WhiteOnBlue.svg"
        width="24"
        height="24"
        alt=""
      />
      <span>シェア</span>
    </a>
  );
}
