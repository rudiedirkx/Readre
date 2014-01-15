<?php

// http://www.bishopfox.com/blog/2013/10/linkedin-intro/

if ( empty($_GET['url']) ) {
	exit('Need <code>url</code>.');
}

// header('Content-type: html/text; charset=utf-8');

// Fetch resource
$url = $_GET['url'];
$_url = parse_url($url);
$urlPrefix = $_url['scheme'] . '://' . $_url['host'];

$cid = 'raw-' . bin2hex($url) . '.html';
$cfile = 'cache/' . $cid;
$html = file_get_contents(($cexists = file_exists($cfile)) ? $cfile : $url);
$cexists or file_put_contents($cfile, $html);

// Strip all from:
$html = preg_replace('#<script[\s\S]*?</script>#', '', $html);
$html = preg_replace('#<link[^>]+?>#', '', $html);
$html = preg_replace('#<style[\s\S]*?</style>#', '', $html);

// Now the hard part: extract readable content
$candidates = array(
	'#<(\w+)[^>]+id="content"[^>]*>#', // #content
	'#<(\w+)[^>]+class="([^"\']+\s+)*postlist(\s+[^"\']+)*"[^>]*>#', // .postlist
	'#<(\w+)[^>]+class="([^"\']+\s+)*content(\s+[^"\']+)*"[^>]*>#', // .content
	'#<(\w+)[^>]+class="([^"\']+\s+)*post(\s+[^"\']+)*"[^>]*>#', // .post
);
foreach ( $candidates as $candidate ) {
	if ( preg_match($candidate, $html, $match, PREG_OFFSET_CAPTURE) ) {
		$tag = $match[1][0];
		$offset = $match[0][1];
		$html = substr($html, $offset);
		preg_match_all('#<(/?)' . $tag . '[^>]*>#', $html, $matches, PREG_OFFSET_CAPTURE);
		$depth = 0;
		foreach ( $matches[1] as $i => $match ) {
			$start = !$match[0];

			$depth += $start ? 1 : -1;
			if ( $depth == 0 ) {
				$offset = $matches[0][$i][1] + strlen($matches[0][$i][1]);
				$html = substr($html, 0, $offset + strlen($tag) - 1);
				break;
			}
		}
		break;
	}
}

// Strip other nonsense
$keepTags = array('a', 'p', 'blockquote', 'h2', 'h3', 'h4', 'strong', 'i', 'b', 'br', 'em', 'code', 'pre', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th');
$html = strip_tags($html, '<' . implode('><', $keepTags) . '>');

// Replace relative with absolute URLs
$html = preg_replace('#(href|src)=(["\'])/#', '\1=\2' . $urlPrefix . '/', $html);

// Replace http, with https, IF we're on https. Screw it if the target server doesn't server HTTPS
$https = !empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) != 'off';
if ( $https ) {
	$html = preg_replace('#(["\'])http:#', '\1https:', $html);
}

// Print
echo '<meta charset="utf-8" />' . "\n\n";
echo '<p><a href="' . $url . '">Go to original: ' . $url . '</a></p>' . "\n";
echo trim($html) . "\n";
