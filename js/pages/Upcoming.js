import { store } from "../main.js";
import { embed } from "../util.js";
import { fetchEditors, fetchUpcoming } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <table class="list" v-if="list && list.length > 0">
                    <tr v-for="(level, i) in list" :key="i">
                        <td class="rank">
                            <p class="type-label-lg">#{{ level.rank || i + 1 }}</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == i, 'error': !level }">
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ level?.level || 'Error (Missing Name)' }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
                <p v-else style="padding: 1rem; text-align: center;">No upcoming levels listed.</p>
            </div>
            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.level }}</h1>
                    <LevelAuthors :author="level.creator || 'Unknown'" :creators="[]" :verifier="level.player || 'Unknown'"></LevelAuthors>
                    
                    <iframe v-if="level.verification || level.showcase" class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                    
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ level.points || 0 }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID / Placement</div>
                            <p>{{ level.placement || level.id || 'N/A' }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Password</div>
                            <p>Free to Copy</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <p><strong>100%</strong> or better to qualify</p>
                    <table class="records">
                        <tr class="record">
                            <td class="percent">
                                <p>{{ level.progress || level.percentage || 100 }}%</p>
                            </td>
                            <td class="user">
                                <a v-if="level.link" :href="level.link" target="_blank" class="type-label-lg">{{ level.player }}</a>
                                <span v-else class="type-label-lg">{{ level.player }}</span>
                            </td>
                            <td class="mobile"></td>
                            <td class="hz">
                                <p>N/A</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="level" style="height: 100%; justify-content: center; align-items: center;" v-else>
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <div class="og">
                        <p class="type-label-md">Website layout made by <a href="https://tsl.pages.dev/" target="_blank">TheShittyList</a></p>
                    </div>
                    <template v-if="editors">
                        <h3>List Editors</h3>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="'/assets/' + roleIconMap[editor.role] + (store.dark ? '-dark' : '') + '.svg'" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                    <h3>Submission Requirements</h3>
                    <p>
                        Achieved the record without using hacks (however, FPS bypass is allowed, up to 360fps)
                    </p>
                    <p>
                        Achieved the record on the level that is listed on the site - please check the level ID before you submit a record
                    </p>
                    <p>
                        Have either source audio or clicks/taps in the video. Edited audio only does not count
                    </p>
                    <p>
                        The recording must have a previous attempt and entire death animation shown before the completion, unless the completion is on the first attempt. Everyplay records are exempt from this
                    </p>
                    <p>
                        The recording must also show the player hit the endwall, or the completion will be invalidated.
                    </p>
                    <p>
                        Do not use secret routes or bug routes
                    </p>
                    <p>
                        Do not use easy modes, only a record of the unmodified level qualifies
                    </p>
                    <p>
                        Once a level falls onto the Legacy List, we accept records for it for 24 hours after it falls off, then afterwards we never accept records for said level
                    </p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store
    }),
    computed: {
        level() {
            return this.list && this.list.length > 0 ? this.list[this.selected] : null;
        },
        video() {
            if (!this.level) return '';
            const videoUrl = this.level.showcase || this.level.verification || '';
            return embed(videoUrl);
        },
    },
    async mounted() {
        this.list = await fetchUpcoming();
        this.editors = await fetchEditors();

        if (!this.list) {
            this.errors = [
                "Failed to load upcoming list. Retry in a few minutes or notify list staff.",
            ];
        } else if (!Array.isArray(this.list)) {
            this.errors = ["Upcoming list data format is invalid."];
            this.list = [];
        } else {
            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
        }

        this.loading = false;
    },
    methods: {
        embed,
    },
};
