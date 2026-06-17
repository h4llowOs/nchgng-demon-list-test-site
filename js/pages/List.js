import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

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
                <div class="list-cards" v-if="list">
                    <div 
                        v-for="([level, err], i) in list" 
                        :key="i"
                        class="level-card-wrapper"
                    >
                        <div 
                            class="level-card" 
                            :class="{ 'active': selected == i, 'error': !level }"
                            @click="level && (selected = i)"
                        >
                            <div class="card-rank">
                                #{{ i + 1 <= 150 ? i + 1 : 'Legacy' }}
                            </div>
                            
                            <div class="card-body-wrapper">
                                <div class="card-main-content">
                                    <div class="card-thumbnail">
                                        <img 
                                            v-if="level" 
                                            :src="'https://img.youtube.com/vi/' + (level.verification || level.showcase).split('v=')[1]?.split('&')[0] + '/mqdefault.jpg'" 
                                            alt="Thumbnail"
                                        >
                                        <div v-else class="thumb-error">Error</div>
                                    </div>
                                    <div class="card-info">
                                        <h3 class="card-title">{{ level?.name || \`Error (\${err}.json)\` }}</h3>
                                        <p class="card-author" v-if="level">by {{ level.author }}</p>
                                        <p class="card-verifier" v-if="level">Verifier: {{ level.verifier }}</p>
                                        <p class="card-points" v-if="level">{{ score(i + 1, 100, level.percentToQualify) }} pts</p>
                                    </div>
                                </div>
                                
                                <div class="card-tags" v-if="level && level.tags && level.tags.length">
                                    <span v-for="(tag, tagIndex) in level.tags" :key="tagIndex" class="tag-badge">
                                        {{ tag }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="card-external-icon" v-if="level">
                            <img src="https://static.wikia.nocookie.net/geometry-dash-unofficial/images/3/36/Extreme_Demon.png/revision/latest?cb=20180214082927" alt="Extreme Demon">
                        </div>
                    </div>
                </div>
            </div>
            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <iframe class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ score(selected + 1, 100, level.percentToQualify) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p>{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Password</div>
                            <p>{{ level.password || 'Free to Copy' }}</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <p v-if="selected + 1 <= 75"><strong>{{ level.percentToQualify }}%</strong> or better to qualify</p>
                    <p v-else-if="selected + 1 <= 150"><strong>100%</strong> or better to qualify</p>
                    <p v-else>This level does not accept new records.</p>
                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent">
                                <p>{{ record.percent }}%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                            <td class="hz">
                                <p>{{ record.hz }}Hz</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container" :class="{ 'meta-hidden': !showMeta }">
                <button class="meta-toggle-btn" @click="showMeta = !showMeta">
                    <span v-if="showMeta">▶</span>
                    <span v-else>◀</span>
                </button>
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
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                    <h3>Submission Requirements</h3>
                    <p>Achieved the record without using hacks (however, FPS bypass is allowed, up to any fps)</p>
                    <p>Forward from the date of June 12th 2026, we will no longer be accepting records that have no recording and do not follow the requirements.</p>
                    <p>CBF may be utilized for records, but tps bypass is strictly prohibited.</p>
                    <p>If no progress is made on an upcoming level in over 2 weeks, it will be removed from the list (Only applies to levels without significant progress of 70% or more)</p>
                    <p>Unrated / Shitty levels may be added to the list, but only if their original version is not on the list. Submit levels to be added via the Discord.</p>
                    <p>Achieved the record on the level that is listed on the site - please check the level ID before you submit a record</p>
                    <p>Have either source audio or clicks/taps in the video. Edited audio only does not count</p>
                    <p>The recording must have a previous attempt and entire death animation shown before the completion, unless the completion is on the first attempt. Everyplay records are exempt from this</p>
                    <p>The recording must also show the player hit the endwall, or the completion will be invalidated.</p>
                    <p>Do not use secret routes or bug routes</p>
                    <p>Do not use easy modes, only a record of the unmodified level qualifies</p>
                    <p>Once a level falls onto the Legacy List, we accept records for it for 24 hours after it falls off, then afterwards we never accept records for said level</p>
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
        store,
        showMeta: true
    }),
    computed: {
        level() {
            return this.list[this.selected]?.[0];
        },
        video() {
            if (!this.level.showcase) {
                return embed(this.level.verification);
            }
            return embed(
                this.toggledShowcase
                    ? this.level.showcase
                    : this.level.verification
            );
        },
    },
    async mounted() {
        this.list = await fetchList();
        this.editors = await fetchEditors();

        if (!this.list) {
            this.errors = [
                "Failed to load list. Retry in a few minutes or notify list staff.",
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `Failed to load level. (${err}.json)`;
                    })
            );
            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
        }
        this.loading = false;
    },
    methods: {
        embed,
        score,
    },
};
