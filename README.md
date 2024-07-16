# Route-boxer

Google Maps API does not support searching places along side a path. RouteBoxer is the algorithm to solve the problem.

This is a reimplementation of RouteBoxer algorithm using various line clipping algorithm to identify boxes that are crossed by the polylines of finding path. 

Reference: A. Pinandito, M. C. Saputra and R. S. Perdana, "RouteBoxer library for Google Android platform," 2016 IEEE Asia Pacific Conference on Wireless and Mobile (APWiMob), Bandung, Indonesia, 2016, pp. 46-51, doi: 10.1109/APWiMob.2016.7811440.

## Video

<script>
  import { YouTube } from 'sveltekit-embed'
  import GitHub from '$lib/components/extra/github.svelte'
</script>

<YouTube youTubeId="JrVwR5KaHTs" />

<br />

## Step by step visualization
![alt text](https://ntvthuyen.com/assets/routeboxer/screenshot(1).jpg "Rote Boxer")
![alt text](https://ntvthuyen.com/assets/routeboxer/screenshot(2).jpg "Rote Boxer")
![alt text](https://ntvthuyen.com/assets/routeboxer/screenshot(3).jpg "Rote Boxer")
![alt text](https://ntvthuyen.com/assets/routeboxer/screenshot(4).jpg "Rote Boxer")
### Horizontal merging
![alt text](https://ntvthuyen.com/assets/routeboxer/screenshot(5).jpg "Rote Boxer")
![alt text](https://ntvthuyen.com/assets/routeboxer/screenshot(6).jpg "Rote Boxer")
### Vertical merging
![alt text](https://ntvthuyen.com/assets/routeboxer/screenshot(7).jpg "Rote Boxer")
![alt text](https://ntvthuyen.com/assets/routeboxer/screenshot(8).jpg "Rote Boxer")
